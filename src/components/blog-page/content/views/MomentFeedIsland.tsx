import { useEffect } from "preact/hooks";
import {
  BLOG_EVENTS,
  type MomentPublishedDetail,
} from "../../events";

const getImageGridClass = (count: number) => {
  if (count === 1) return "moment-img-grid moment-img-1";
  if (count === 2) return "moment-img-grid moment-img-2";
  if (count === 3) return "moment-img-grid moment-img-3";
  if (count === 4) return "moment-img-grid moment-img-4";
  if (count <= 6) return "moment-img-grid moment-img-6";
  return "moment-img-grid moment-img-9";
};

const createActionTrigger = () => {
  const button = document.createElement("button");
  button.className = "moment-action-trigger";
  button.type = "button";

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("xmlns", svgNS);
  svg.setAttribute("class", "w-4 h-4");
  svg.setAttribute("viewBox", "0 0 20 20");
  svg.setAttribute("fill", "currentColor");

  const path = document.createElementNS(svgNS, "path");
  path.setAttribute(
    "d",
    "M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z",
  );
  svg.appendChild(path);
  button.appendChild(svg);

  return button;
};

const createLocationNode = (location: string) => {
  const wrapper = document.createElement("span");
  wrapper.className = "moment-location";

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("xmlns", svgNS);
  svg.setAttribute("class", "w-3 h-3");
  svg.setAttribute("fill", "none");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");

  const path1 = document.createElementNS(svgNS, "path");
  path1.setAttribute("stroke-linecap", "round");
  path1.setAttribute("stroke-linejoin", "round");
  path1.setAttribute("d", "M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z");
  const path2 = document.createElementNS(svgNS, "path");
  path2.setAttribute("stroke-linecap", "round");
  path2.setAttribute("stroke-linejoin", "round");
  path2.setAttribute(
    "d",
    "M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0 1 15 0Z",
  );
  svg.append(path1, path2);

  wrapper.append(svg, document.createTextNode(location));
  return wrapper;
};

const MomentFeedIsland = () => {
  useEffect(() => {
    const publishButton = document.getElementById("publish-btn");
    const list = document.getElementById("moment-list");
    if (!list) return;

    const onPublishClick = () => {
      window.dispatchEvent(new CustomEvent(BLOG_EVENTS.openPublishModal));
    };

    const onMomentPublished = (event: Event) => {
      const detail = (event as CustomEvent<MomentPublishedDetail>).detail;
      if (!detail) return;

      const card = document.createElement("article");
      card.className = "moment-card";

      const avatar = document.createElement("div");
      avatar.className = "moment-avatar";
      avatar.style.background = "var(--app-accent-soft)";
      avatar.style.color = "var(--app-accent)";
      avatar.textContent = "R";

      const body = document.createElement("div");
      body.className = "moment-body";

      const name = document.createElement("h3");
      name.className = "moment-name";
      name.textContent = "Reid";

      body.appendChild(name);

      if (detail.text) {
        const text = document.createElement("p");
        text.className = "moment-text";
        text.textContent = detail.text;
        body.appendChild(text);
      }

      if (detail.images.length > 0) {
        const grid = document.createElement("div");
        grid.className = getImageGridClass(detail.images.length);
        detail.images.forEach((url) => {
          const item = document.createElement("div");
          item.className = "moment-img-item";
          item.style.overflow = "hidden";
          item.style.borderRadius = "4px";
          const image = document.createElement("img");
          image.src = url;
          image.alt = "moment image";
          image.style.width = "100%";
          image.style.height = "100%";
          image.style.objectFit = "cover";
          item.appendChild(image);
          grid.appendChild(item);
        });
        body.appendChild(grid);
      }

      const meta = document.createElement("div");
      meta.className = "moment-meta";
      const metaLeft = document.createElement("div");
      metaLeft.className = "moment-meta-left";
      const time = document.createElement("span");
      time.className = "moment-time";
      time.textContent = "just now";
      metaLeft.appendChild(time);
      if (detail.location) {
        metaLeft.appendChild(createLocationNode(detail.location));
      }
      meta.append(metaLeft, createActionTrigger());

      body.appendChild(meta);
      card.append(avatar, body);

      list.insertBefore(card, list.firstChild);
      card.style.opacity = "0";
      card.style.transform = "translateY(-10px)";
      card.style.transition = "all 0.35s ease";
      requestAnimationFrame(() => {
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
      });
    };

    publishButton?.addEventListener("click", onPublishClick);
    window.addEventListener(BLOG_EVENTS.momentPublished, onMomentPublished);

    return () => {
      publishButton?.removeEventListener("click", onPublishClick);
      window.removeEventListener(BLOG_EVENTS.momentPublished, onMomentPublished);
    };
  }, []);

  return null;
};

export default MomentFeedIsland;
