"""
=============================================================================
  CROP DISEASE DETECTION SYSTEM
  Using Transfer Learning (MobileNetV2) + TensorFlow/Keras
  Dataset: PlantVillage (via TensorFlow Datasets or local folder)
=============================================================================

INSTALL DEPENDENCIES:
    pip install tensorflow numpy matplotlib scikit-learn pillow seaborn

HOW TO RUN:
    python crop_disease_detection.py

    By default it uses TensorFlow's `tf_flowers` dataset as a demo stand-in.
    To use PlantVillage:
      1. Download from: https://www.kaggle.com/datasets/emmarex/plantdisease
      2. Set DATA_DIR to the extracted folder path below.
=============================================================================
"""

# ─────────────────────────────────────────────────────────────────────────────
# 0. IMPORTS
# ─────────────────────────────────────────────────────────────────────────────
import os
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.callbacks import (
    EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
)

from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import train_test_split

print(f"TensorFlow version : {tf.__version__}")
print(f"GPUs available     : {tf.config.list_physical_devices('GPU')}")


# ─────────────────────────────────────────────────────────────────────────────
# 1. CONFIGURATION  — tweak these to match your setup
# ─────────────────────────────────────────────────────────────────────────────
# Set DATA_DIR to your PlantVillage folder, or leave None to auto-download
# the tf_flowers demo dataset.
DATA_DIR = None   # e.g. "/path/to/PlantVillage"

IMG_SIZE    = (224, 224)   # MobileNetV2 native input size
BATCH_SIZE  = 32
EPOCHS      = 20           # EarlyStopping will stop sooner if needed
SEED        = 42
SAVE_PATH   = "crop_disease_model.h5"

tf.random.set_seed(SEED)
np.random.seed(SEED)


# ─────────────────────────────────────────────────────────────────────────────
# 2. LOAD DATASET
# ─────────────────────────────────────────────────────────────────────────────
def load_dataset(data_dir=None, img_size=IMG_SIZE, batch_size=BATCH_SIZE):
    """
    Load images from a directory structured as:
        root/
          class_a/  img1.jpg  img2.jpg ...
          class_b/  img1.jpg  ...

    If data_dir is None we download tf_flowers as a quick demo (~200 MB).
    PlantVillage has 38 classes and ~54,000 images — same code works.
    """
    if data_dir is None:
        print("\n[INFO] No DATA_DIR set — downloading tf_flowers demo dataset …")
        import tensorflow_datasets as tfds
        (raw_train, raw_val, raw_test), meta = tfds.load(
            "tf_flowers",
            split=["train[:70%]", "train[70%:85%]", "train[85%:]"],
            with_info=True,
            as_supervised=True,
        )
        class_names = meta.features["label"].names
        num_classes = meta.features["label"].num_classes

        def preprocess(image, label):
            image = tf.image.resize(image, img_size)
            image = tf.cast(image, tf.float32) / 255.0
            return image, label

        def augment(image, label):
            image = tf.image.random_flip_left_right(image)
            image = tf.image.random_brightness(image, 0.15)
            image = tf.image.random_contrast(image, 0.8, 1.2)
            return image, label

        train_ds = (raw_train
                    .map(preprocess, num_parallel_calls=tf.data.AUTOTUNE)
                    .map(augment,    num_parallel_calls=tf.data.AUTOTUNE)
                    .shuffle(1000)
                    .batch(batch_size)
                    .prefetch(tf.data.AUTOTUNE))

        val_ds   = (raw_val
                    .map(preprocess, num_parallel_calls=tf.data.AUTOTUNE)
                    .batch(batch_size)
                    .prefetch(tf.data.AUTOTUNE))

        test_ds  = (raw_test
                    .map(preprocess, num_parallel_calls=tf.data.AUTOTUNE)
                    .batch(batch_size)
                    .prefetch(tf.data.AUTOTUNE))

        return train_ds, val_ds, test_ds, class_names, num_classes

    # ── Local folder (PlantVillage or any ImageNet-style directory) ──────────
    print(f"\n[INFO] Loading dataset from: {data_dir}")

    full_ds = keras.utils.image_dataset_from_directory(
        data_dir,
        image_size=img_size,
        batch_size=None,          # we'll batch after splitting
        label_mode="int",
        seed=SEED,
    )
    class_names = full_ds.class_names
    num_classes = len(class_names)
    total       = full_ds.cardinality().numpy()

    # 70 / 15 / 15 split
    train_size = int(0.70 * total)
    val_size   = int(0.15 * total)

    full_ds = full_ds.shuffle(total, seed=SEED)
    raw_train = full_ds.take(train_size)
    raw_val   = full_ds.skip(train_size).take(val_size)
    raw_test  = full_ds.skip(train_size + val_size)

    def preprocess(image, label):
        image = tf.cast(image, tf.float32) / 255.0
        return image, label

    def augment(image, label):
        image = tf.image.random_flip_left_right(image)
        image = tf.image.random_flip_up_down(image)
        image = tf.image.random_brightness(image, 0.15)
        image = tf.image.random_contrast(image, 0.8, 1.2)
        image = tf.image.random_saturation(image, 0.8, 1.2)
        return image, label

    train_ds = (raw_train
                .map(preprocess, num_parallel_calls=tf.data.AUTOTUNE)
                .map(augment,    num_parallel_calls=tf.data.AUTOTUNE)
                .batch(batch_size)
                .prefetch(tf.data.AUTOTUNE))

    val_ds   = (raw_val
                .map(preprocess, num_parallel_calls=tf.data.AUTOTUNE)
                .batch(batch_size)
                .prefetch(tf.data.AUTOTUNE))

    test_ds  = (raw_test
                .map(preprocess, num_parallel_calls=tf.data.AUTOTUNE)
                .batch(batch_size)
                .prefetch(tf.data.AUTOTUNE))

    print(f"  Classes ({num_classes}): {class_names}")
    return train_ds, val_ds, test_ds, class_names, num_classes


# ─────────────────────────────────────────────────────────────────────────────
# 3. VISUALISE A SAMPLE BATCH
# ─────────────────────────────────────────────────────────────────────────────
def show_sample_batch(dataset, class_names, n=9):
    """Display a grid of sample images with their labels."""
    plt.figure(figsize=(10, 10))
    for images, labels in dataset.take(1):
        for i in range(min(n, len(images))):
            ax = plt.subplot(3, 3, i + 1)
            plt.imshow(images[i].numpy())
            plt.title(class_names[labels[i]], fontsize=9)
            plt.axis("off")
    plt.suptitle("Sample Training Images", fontsize=12)
    plt.tight_layout()
    plt.savefig("sample_batch.png", dpi=120)
    plt.show()
    print("[INFO] Saved sample_batch.png")


# ─────────────────────────────────────────────────────────────────────────────
# 4. BUILD MODEL  — MobileNetV2 (transfer learning) + custom head
# ─────────────────────────────────────────────────────────────────────────────
def build_model(num_classes, img_size=IMG_SIZE):
    """
    Two-phase transfer learning:
      Phase 1 — Freeze MobileNetV2 base, train only the new head (fast).
      Phase 2 — Unfreeze the top ~30 layers and fine-tune (higher accuracy).

    MobileNetV2 is only ~14 MB, runs well on CPU, yet achieves excellent
    accuracy when fine-tuned — ideal for a lightweight prototype.
    """
    base = MobileNetV2(
        input_shape=(*img_size, 3),
        include_top=False,
        weights="imagenet",
    )
    base.trainable = False   # freeze during phase-1

    inputs  = keras.Input(shape=(*img_size, 3))
    x       = base(inputs, training=False)
    x       = layers.GlobalAveragePooling2D()(x)
    x       = layers.BatchNormalization()(x)
    x       = layers.Dense(256, activation="relu")(x)
    x       = layers.Dropout(0.4)(x)
    outputs = layers.Dense(num_classes, activation="softmax")(x)

    model = keras.Model(inputs, outputs)
    model.compile(
        optimizer=keras.optimizers.Adam(1e-3),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )
    print("\n[MODEL] Phase-1 architecture (base frozen):")
    model.summary()
    return model, base


# ─────────────────────────────────────────────────────────────────────────────
# 5. TRAIN
# ─────────────────────────────────────────────────────────────────────────────
def train_model(model, base, train_ds, val_ds, epochs=EPOCHS, save_path=SAVE_PATH):
    """
    Phase 1: Train only the new head (5 epochs or until convergence).
    Phase 2: Unfreeze top layers and fine-tune at a lower learning rate.
    """
    callbacks = [
        EarlyStopping(patience=5, restore_best_weights=True, verbose=1),
        ModelCheckpoint(save_path, save_best_only=True, verbose=1),
        ReduceLROnPlateau(factor=0.5, patience=3, min_lr=1e-6, verbose=1),
    ]

    # ── Phase 1 ────────────────────────────────────────────────────────────
    print("\n[TRAIN] Phase 1 — training classification head …")
    history1 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=min(5, epochs),
        callbacks=callbacks,
    )

    # ── Phase 2 — fine-tune top layers ─────────────────────────────────────
    print("\n[TRAIN] Phase 2 — fine-tuning top 30 MobileNetV2 layers …")
    base.trainable = True
    for layer in base.layers[:-30]:   # keep bottom layers frozen
        layer.trainable = False

    model.compile(
        optimizer=keras.optimizers.Adam(1e-5),   # much lower LR
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )

    history2 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=epochs,
        initial_epoch=len(history1.history["loss"]),
        callbacks=callbacks,
    )

    # Merge histories
    merged = {}
    for k in history1.history:
        merged[k] = history1.history[k] + history2.history.get(k, [])

    return merged


# ─────────────────────────────────────────────────────────────────────────────
# 6. PLOT TRAINING CURVES
# ─────────────────────────────────────────────────────────────────────────────
def plot_history(history):
    """Plot accuracy and loss curves for train & validation sets."""
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))

    # Accuracy
    axes[0].plot(history["accuracy"],     label="Train Accuracy", linewidth=2)
    axes[0].plot(history["val_accuracy"], label="Val Accuracy",   linewidth=2)
    axes[0].set_title("Model Accuracy")
    axes[0].set_xlabel("Epoch")
    axes[0].set_ylabel("Accuracy")
    axes[0].legend()
    axes[0].grid(True, alpha=0.3)

    # Loss
    axes[1].plot(history["loss"],     label="Train Loss", linewidth=2)
    axes[1].plot(history["val_loss"], label="Val Loss",   linewidth=2)
    axes[1].set_title("Model Loss")
    axes[1].set_xlabel("Epoch")
    axes[1].set_ylabel("Loss")
    axes[1].legend()
    axes[1].grid(True, alpha=0.3)

    plt.tight_layout()
    plt.savefig("training_curves.png", dpi=120)
    plt.show()
    print("[INFO] Saved training_curves.png")


# ─────────────────────────────────────────────────────────────────────────────
# 7. EVALUATE — accuracy, classification report, confusion matrix
# ─────────────────────────────────────────────────────────────────────────────
def evaluate_model(model, test_ds, class_names):
    """Compute test accuracy and plot confusion matrix."""
    print("\n[EVAL] Evaluating on test set …")
    loss, acc = model.evaluate(test_ds, verbose=1)
    print(f"\n  Test Accuracy : {acc * 100:.2f}%")
    print(f"  Test Loss     : {loss:.4f}")

    # Collect all predictions
    y_true, y_pred = [], []
    for images, labels in test_ds:
        preds = model.predict(images, verbose=0)
        y_true.extend(labels.numpy())
        y_pred.extend(np.argmax(preds, axis=1))

    y_true = np.array(y_true)
    y_pred = np.array(y_pred)

    # Classification report
    print("\n[EVAL] Per-class report:")
    print(classification_report(y_true, y_pred, target_names=class_names))

    # Confusion matrix
    cm = confusion_matrix(y_true, y_pred)
    fig_size = max(8, len(class_names))
    plt.figure(figsize=(fig_size, fig_size))
    sns.heatmap(
        cm,
        annot=True,
        fmt="d",
        cmap="Blues",
        xticklabels=class_names,
        yticklabels=class_names,
    )
    plt.title("Confusion Matrix")
    plt.ylabel("True Label")
    plt.xlabel("Predicted Label")
    plt.xticks(rotation=45, ha="right", fontsize=8)
    plt.yticks(rotation=0, fontsize=8)
    plt.tight_layout()
    plt.savefig("confusion_matrix.png", dpi=120)
    plt.show()
    print("[INFO] Saved confusion_matrix.png")

    return acc


# ─────────────────────────────────────────────────────────────────────────────
# 8. PREDICT ON A NEW IMAGE
# ─────────────────────────────────────────────────────────────────────────────
def predict_image(model_path, image_path, class_names, img_size=IMG_SIZE):
    """
    Load the saved model and predict the disease class of a new leaf image.

    Usage (standalone):
        from crop_disease_detection import predict_image
        predict_image("crop_disease_model.h5", "leaf.jpg", class_names)
    """
    from PIL import Image

    # Load model
    model = keras.models.load_model(model_path)

    # Load and preprocess image
    img = Image.open(image_path).convert("RGB").resize(img_size)
    arr = np.array(img, dtype=np.float32) / 255.0
    arr = np.expand_dims(arr, axis=0)     # shape: (1, 224, 224, 3)

    # Predict
    probs      = model.predict(arr, verbose=0)[0]
    top_idx    = np.argsort(probs)[::-1][:3]
    top_labels = [(class_names[i], float(probs[i])) for i in top_idx]

    print(f"\n[PREDICT] Image: {image_path}")
    print(f"  → Top prediction : {top_labels[0][0]}  ({top_labels[0][1]*100:.1f}%)")
    for label, prob in top_labels[1:]:
        print(f"     Runner-up      : {label}  ({prob*100:.1f}%)")

    # Visualise
    plt.figure(figsize=(5, 5))
    plt.imshow(img)
    plt.title(f"{top_labels[0][0]}\n{top_labels[0][1]*100:.1f}% confidence")
    plt.axis("off")
    plt.tight_layout()
    plt.savefig("prediction_result.png", dpi=120)
    plt.show()

    return top_labels


# ─────────────────────────────────────────────────────────────────────────────
# 9. MAIN
# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":

    # Step 1 — Load data
    train_ds, val_ds, test_ds, class_names, num_classes = load_dataset(DATA_DIR)

    # Step 2 — Visualise a sample
    show_sample_batch(train_ds, class_names)

    # Step 3 — Build model
    model, base = build_model(num_classes)

    # Step 4 — Train
    history = train_model(model, base, train_ds, val_ds)

    # Step 5 — Plot training curves
    plot_history(history)

    # Step 6 — Evaluate
    test_accuracy = evaluate_model(model, test_ds, class_names)

    print(f"\n{'='*60}")
    print(f"  FINAL TEST ACCURACY : {test_accuracy * 100:.2f}%")
    print(f"  Saved model         : {SAVE_PATH}")
    print(f"{'='*60}")

    # Step 7 — Prediction example (uncomment and set your image path)
    # predict_image(SAVE_PATH, "path/to/leaf_image.jpg", class_names)
