import { useEffect } from "preact/hooks";

const PostProgressIsland = () => {
  useEffect(() => {
    const progressBar = document.getElementById("reading-progress");
    if (!progressBar) return;

    const updateProgress = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const percent = total > 0 ? Math.min(1, window.scrollY / total) : 0;
      progressBar.style.width = `${percent * 100}%`;
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  return null;
};

export default PostProgressIsland;
