import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, TextField } from "@renderer/components";
import "./dev-portal.scss";

interface SubmissionForm {
  title: string;
  description: string;
  gameUrl: string;
  genres: string;
  coverImageUrl: string;
}

const EMPTY_FORM: SubmissionForm = {
  title: "",
  description: "",
  gameUrl: "",
  genres: "",
  coverImageUrl: "",
};

const SDK_SNIPPET = `<!-- Add this snippet to your game's <head> to enable the VAPOR SDK -->
<script>
  (function () {
    window.vapor = {
      /** Save arbitrary data for the current user */
      save: function (data) {
        return sendRequest("vapor:save", { data: data });
      },
      /** Load previously saved data */
      load: function () {
        return sendRequest("vapor:load");
      },
      /** Submit a score to the global leaderboard */
      submitScore: function (score) {
        return sendRequest("vapor:submitScore", { score: score });
      },
      /** Unlock an achievement by its ID */
      unlockAchievement: function (id) {
        return sendRequest("vapor:achievement", { id: id });
      },
      /** Ask the platform to enter fullscreen */
      requestFullscreen: function () {
        window.parent.postMessage({ type: "vapor:requestFullscreen" }, "*");
      },
    };

    var callbacks = {};

    function sendRequest(type, extra) {
      return new Promise(function (resolve, reject) {
        var id = Math.random().toString(36).slice(2);
        callbacks[id] = { resolve: resolve, reject: reject };
        window.parent.postMessage(Object.assign({ type: type, requestId: id }, extra), "*");
      });
    }

    window.addEventListener("message", function (event) {
      var msg = event.data;
      if (!msg || typeof msg.type !== "string") return;
      var cb = callbacks[msg.requestId];
      if (!cb) return;
      delete callbacks[msg.requestId];
      msg.ok ? cb.resolve(msg) : cb.reject(new Error("vapor SDK error"));
    });

    // Signal that the game is ready
    window.parent.postMessage({ type: "vapor:ready" }, "*");
  })();
<\/script>`;

export default function DevPortal() {
  const { t } = useTranslation("dev_portal");

  const [form, setForm] = useState<SubmissionForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sdkCopied, setSdkCopied] = useState(false);

  const handleChange = useCallback(
    (field: keyof SubmissionForm) => (value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!form.title.trim() || !form.gameUrl.trim()) return;

      setSubmitting(true);
      setError(null);

      try {
        // In a real implementation this would POST to /api/developer/games
        await new Promise((r) => setTimeout(r, 900));
        setSubmitted(true);
        setForm(EMPTY_FORM);
      } catch {
        setError(t("submit_error"));
      } finally {
        setSubmitting(false);
      }
    },
    [form, t]
  );

  const handleCopySnippet = useCallback(() => {
    navigator.clipboard.writeText(SDK_SNIPPET).then(() => {
      setSdkCopied(true);
      setTimeout(() => setSdkCopied(false), 2000);
    });
  }, []);

  return (
    <div className="dev-portal">
      <header className="dev-portal__header">
        <span className="dev-portal__eyebrow">Developer Portal</span>
        <h1>{t("page_title")}</h1>
        <p className="dev-portal__subtitle">{t("page_subtitle")}</p>
      </header>

      <div className="dev-portal__layout">
        {/* ── Left: submission form ─────────────────────────────── */}
        <div className="dev-portal__main">
          <section className="dev-portal__card">
            <h2>{t("submit_game")}</h2>
            <p className="dev-portal__card-description">
              {t("submit_game_description")}
            </p>

            {submitted ? (
              <div className="dev-portal__success">
                <span className="dev-portal__success-icon">✅</span>
                <p>{t("submit_success")}</p>
                <Button theme="outline" onClick={() => setSubmitted(false)}>
                  {t("submit_game")}
                </Button>
              </div>
            ) : (
              <form
                className="dev-portal__form"
                onSubmit={handleSubmit}
                noValidate
              >
                <TextField
                  label={t("game_title")}
                  placeholder={t("game_title_placeholder")}
                  value={form.title}
                  onChange={handleChange("title")}
                  required
                />

                <div className="dev-portal__field">
                  <label className="dev-portal__label">
                    {t("game_description")}
                  </label>
                  <textarea
                    className="dev-portal__textarea"
                    placeholder={t("game_description_placeholder")}
                    value={form.description}
                    onChange={(e) => handleChange("description")(e.target.value)}
                    rows={4}
                  />
                </div>

                <TextField
                  label={t("game_url")}
                  placeholder={t("game_url_placeholder")}
                  value={form.gameUrl}
                  onChange={handleChange("gameUrl")}
                  required
                />

                <TextField
                  label={t("game_genres")}
                  placeholder={t("game_genres_placeholder")}
                  value={form.genres}
                  onChange={handleChange("genres")}
                />

                <TextField
                  label={t("cover_image_url")}
                  placeholder={t("cover_image_url_placeholder")}
                  value={form.coverImageUrl}
                  onChange={handleChange("coverImageUrl")}
                />

                {error && <p className="dev-portal__error">{error}</p>}

                <Button
                  type="submit"
                  theme="primary"
                  disabled={submitting || !form.title.trim() || !form.gameUrl.trim()}
                >
                  {submitting ? "Submitting…" : t("submit_button")}
                </Button>
              </form>
            )}
          </section>

          {/* ── SDK snippet ──────────────────────────────────────── */}
          <section className="dev-portal__card">
            <h2>{t("section_sdk")}</h2>
            <p className="dev-portal__card-description">
              {t("sdk_description")}
            </p>

            <div className="dev-portal__code-block">
              <pre>{SDK_SNIPPET}</pre>
              <button
                type="button"
                className="dev-portal__copy-btn"
                onClick={handleCopySnippet}
              >
                {sdkCopied ? t("sdk_copied") : t("sdk_copy")}
              </button>
            </div>
          </section>
        </div>

        {/* ── Right: sidebar guidelines ─────────────────────────── */}
        <aside className="dev-portal__sidebar">
          <section className="dev-portal__card">
            <h2>{t("section_guidelines")}</h2>
            <ul className="dev-portal__guidelines">
              <li>{t("guideline_html5")}</li>
              <li>{t("guideline_responsive")}</li>
              <li>{t("guideline_safe")}</li>
              <li>{t("guideline_sdk")}</li>
            </ul>
          </section>

          <section className="dev-portal__card dev-portal__card--muted">
            <h2>{t("section_analytics")}</h2>
            <p className="dev-portal__card-description">
              {t("analytics_description")}
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
