import { useEffect } from "preact/hooks";
import { BLOG_EVENTS } from "../events";

const MomentPublishModalIsland = () => {
  useEffect(() => {
    const modal = document.getElementById("publish-modal") as HTMLElement | null;
    const cancelBtn = document.getElementById("modal-cancel") as HTMLElement | null;
    const submitBtn = document.getElementById("modal-submit") as HTMLElement | null;
    const textArea = document.getElementById("moment-text") as HTMLTextAreaElement | null;
    const imageInput = document.getElementById("image-input") as HTMLInputElement | null;
    const toolbarImageInput = document.getElementById(
      "toolbar-image-input",
    ) as HTMLInputElement | null;
    const previewGrid = document.getElementById("image-preview-grid") as HTMLElement | null;
    const imageAddBtn = document.getElementById("image-add-btn") as HTMLElement | null;
    const locationBtn = document.getElementById("location-btn") as HTMLElement | null;
    const locationPanel = document.getElementById("location-panel") as HTMLElement | null;
    const locationInput = document.getElementById("location-input") as HTMLInputElement | null;

    if (
      !modal ||
      !textArea ||
      !previewGrid ||
      !locationPanel ||
      !locationInput
    ) {
      return;
    }

    let selectedFiles: File[] = [];

    const updateAddBtnVisibility = () => {
      if (!imageAddBtn) return;
      imageAddBtn.style.display = selectedFiles.length >= 9 ? "none" : "inline-flex";
    };

    const renderPreviews = () => {
      previewGrid.innerHTML = "";
      selectedFiles.forEach((file, index) => {
        const item = document.createElement("div");
        item.className = "preview-item";
        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        img.alt = "preview";
        const removeBtn = document.createElement("button");
        removeBtn.className = "remove-btn";
        removeBtn.textContent = "x";
        removeBtn.addEventListener("click", () => {
          selectedFiles.splice(index, 1);
          renderPreviews();
        });
        item.append(img, removeBtn);
        previewGrid.appendChild(item);
      });
      updateAddBtnVisibility();
    };

    const closeModal = () => {
      modal.style.display = "none";
      textArea.value = "";
      selectedFiles = [];
      previewGrid.innerHTML = "";
      locationInput.value = "";
      locationPanel.style.display = "none";
      updateAddBtnVisibility();
    };

    const openModal = () => {
      modal.style.display = "flex";
      textArea.focus();
    };

    const handleFiles = (files: FileList | null) => {
      if (!files) return;
      const remaining = 9 - selectedFiles.length;
      const toAdd = Array.from(files).slice(0, remaining);
      selectedFiles.push(...toAdd);
      renderPreviews();
    };

    const onOverlayClick = (event: Event) => {
      if (event.target === modal) closeModal();
    };

    const onLocationToggle = () => {
      const visible = locationPanel.style.display !== "none";
      locationPanel.style.display = visible ? "none" : "block";
      if (!visible) locationInput.focus();
    };

    const onSubmit = () => {
      const text = textArea.value.trim();
      const location = locationInput.value.trim();
      if (!text && selectedFiles.length === 0) return;

      const imageUrls = selectedFiles.map((file) => URL.createObjectURL(file));
      window.dispatchEvent(
        new CustomEvent(BLOG_EVENTS.momentPublished, {
          detail: { text, images: imageUrls, location },
        }),
      );
      closeModal();
    };

    window.addEventListener(BLOG_EVENTS.openPublishModal, openModal);
    cancelBtn?.addEventListener("click", closeModal);
    modal.addEventListener("click", onOverlayClick);
    imageInput?.addEventListener("change", (event) =>
      handleFiles((event.target as HTMLInputElement).files),
    );
    toolbarImageInput?.addEventListener("change", (event) =>
      handleFiles((event.target as HTMLInputElement).files),
    );
    locationBtn?.addEventListener("click", onLocationToggle);
    submitBtn?.addEventListener("click", onSubmit);

    return () => {
      window.removeEventListener(BLOG_EVENTS.openPublishModal, openModal);
      cancelBtn?.removeEventListener("click", closeModal);
      modal.removeEventListener("click", onOverlayClick);
      locationBtn?.removeEventListener("click", onLocationToggle);
      submitBtn?.removeEventListener("click", onSubmit);
    };
  }, []);

  return null;
};

export default MomentPublishModalIsland;
