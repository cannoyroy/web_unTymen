import { fireEvent, render } from "@testing-library/preact";
import MomentPublishModalIsland from "../../src/components/blog-page/modals/MomentPublishModalIsland";
import { BLOG_EVENTS } from "../../src/components/blog-page/events";

describe("MomentPublishModalIsland", () => {
  it("opens from event and dispatches publish payload", () => {
    document.body.innerHTML = `
      <div id="publish-modal" style="display:none;">
        <button id="modal-cancel" type="button"></button>
        <button id="modal-submit" type="button"></button>
        <textarea id="moment-text"></textarea>
        <input id="image-input" type="file" />
        <input id="toolbar-image-input" type="file" />
        <div id="image-preview-grid"></div>
        <label id="image-add-btn"></label>
        <button id="location-btn" type="button"></button>
        <div id="location-panel" style="display:none;"></div>
        <input id="location-input" />
      </div>
    `;

    const published = vi.fn();
    window.addEventListener(BLOG_EVENTS.momentPublished, published);
    render(<MomentPublishModalIsland />);

    window.dispatchEvent(new CustomEvent(BLOG_EVENTS.openPublishModal));
    const modal = document.getElementById("publish-modal") as HTMLElement;
    expect(modal.style.display).toBe("flex");

    const textArea = document.getElementById("moment-text") as HTMLTextAreaElement;
    textArea.value = "hello";
    const locationInput = document.getElementById("location-input") as HTMLInputElement;
    locationInput.value = "Tokyo";

    fireEvent.click(document.getElementById("modal-submit") as HTMLElement);
    expect(published).toHaveBeenCalledTimes(1);
  });
});
