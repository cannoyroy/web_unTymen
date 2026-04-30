import { useEffect } from "preact/hooks";

const BlogSidebarIsland = () => {
  useEffect(() => {
    const drawer = document.getElementById("drawer-sidebar");
    const backdrop = document.getElementById("drawer-backdrop");
    const closeButton = document.getElementById("drawer-close");
    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const toggleButtons = Array.from(
      document.querySelectorAll<HTMLElement>(".drawer-toggle-btn"),
    );

    if (!drawer) return;

    let isOpen = !mobileQuery.matches;

    const syncToggleVisibility = () => {
      toggleButtons.forEach((button) => {
        button.classList.toggle("!hidden", isOpen);
      });
    };

    const applyDrawerState = () => {
      if (mobileQuery.matches) {
        drawer.style.removeProperty("width");
        drawer.style.removeProperty("transform");
        drawer.style.pointerEvents = isOpen ? "auto" : "none";
        drawer.classList.toggle("translate-x-0", isOpen);
        drawer.classList.toggle("-translate-x-full", !isOpen);
        drawer.classList.toggle("pointer-events-auto", isOpen);
        drawer.classList.toggle("pointer-events-none", !isOpen);
        drawer.classList.toggle("shadow-lg", isOpen);
        backdrop?.classList.toggle("opacity-100", isOpen);
        backdrop?.classList.toggle("pointer-events-auto", isOpen);
      } else if (isOpen) {
        drawer.classList.remove("translate-x-0", "-translate-x-full");
        drawer.classList.remove("pointer-events-none");
        drawer.classList.add("pointer-events-auto");
        drawer.style.setProperty("width", "320px");
        drawer.style.setProperty("transform", "translateX(0)");
        drawer.style.pointerEvents = "auto";
        drawer.classList.remove("shadow-lg");
        backdrop?.classList.remove("opacity-100", "pointer-events-auto");
      } else {
        drawer.classList.remove("translate-x-0", "-translate-x-full");
        drawer.classList.remove("pointer-events-auto");
        drawer.classList.add("pointer-events-none");
        drawer.style.setProperty("width", "0");
        drawer.style.setProperty("transform", "translateX(0)");
        drawer.style.pointerEvents = "none";
        drawer.classList.remove("shadow-lg");
        backdrop?.classList.remove("opacity-100", "pointer-events-auto");
      }
      window.dispatchEvent(
        new CustomEvent("drawer-state-changed", { detail: { isOpen } }),
      );
      syncToggleVisibility();
    };

    const toggleDrawer = () => {
      isOpen = !isOpen;
      applyDrawerState();
    };

    const closeDrawerOnMobile = () => {
      if (!mobileQuery.matches || !isOpen) return;
      isOpen = false;
      applyDrawerState();
    };

    const onDocumentClick = (event: Event) => {
      const target = event.target;
      const targetElement = target instanceof Element ? target : null;
      if (!mobileQuery.matches || !isOpen) return;

      const clickedInsideDrawer = !!targetElement?.closest("#drawer-sidebar");
      const clickedToggle = !!targetElement?.closest(".drawer-toggle-btn");
      if (!clickedInsideDrawer && !clickedToggle) {
        closeDrawerOnMobile();
      }
    };

    const onDrawerClick = (event: Event) => {
      const target = event.target;
      const targetElement = target instanceof Element ? target : null;
      const closeTrigger = targetElement?.closest(
        ".category-nav-btn, .tag-nav-btn, #tag-tree a[href]",
      );
      if (closeTrigger) {
        closeDrawerOnMobile();
      }
    };

    const onBreakpointChange = () => {
      applyDrawerState();
    };

    applyDrawerState();

    toggleButtons.forEach((button) => {
      button.addEventListener("click", toggleDrawer);
    });

    document.addEventListener("click", onDocumentClick);
    closeButton?.addEventListener("click", toggleDrawer);
    backdrop?.addEventListener("click", closeDrawerOnMobile);
    drawer.addEventListener("click", onDrawerClick);
    if (typeof mobileQuery.addEventListener === "function") {
      mobileQuery.addEventListener("change", onBreakpointChange);
    } else {
      mobileQuery.addListener(onBreakpointChange);
    }

    return () => {
      toggleButtons.forEach((button) => {
        button.removeEventListener("click", toggleDrawer);
      });
      document.removeEventListener("click", onDocumentClick);
      closeButton?.removeEventListener("click", toggleDrawer);
      backdrop?.removeEventListener("click", closeDrawerOnMobile);
      drawer.removeEventListener("click", onDrawerClick);
      if (typeof mobileQuery.removeEventListener === "function") {
        mobileQuery.removeEventListener("change", onBreakpointChange);
      } else {
        mobileQuery.removeListener(onBreakpointChange);
      }
    };
  }, []);

  return null;
};

export default BlogSidebarIsland;
