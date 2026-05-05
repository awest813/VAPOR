import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { levelDBService } from "@renderer/services/leveldb.service";
import { orderBy } from "lodash-es";
import { useNavigate } from "react-router-dom";

import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

import { Button, GameCard, Hero } from "@renderer/components";
import type { DownloadSource, ShopAssets, Steam250Game } from "@types";

import starsIconAnimated from "@renderer/assets/icons/stars-animated.gif";

import { buildGameDetailsPath } from "@renderer/helpers";
import { CatalogueCategory } from "@shared";
import "./home.scss";

const categoryEmoji: Record<CatalogueCategory, string> = {
  [CatalogueCategory.Featured]: "⭐",
  [CatalogueCategory.New]: "🆕",
  [CatalogueCategory.Free]: "🎮",
};

export default function Home() {
  const { t } = useTranslation("home");
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [randomGame, setRandomGame] = useState<Steam250Game | null>(null);

  const [currentCatalogueCategory, setCurrentCatalogueCategory] = useState(
    CatalogueCategory.Featured
  );

  const [catalogue, setCatalogue] = useState<
    Record<CatalogueCategory, ShopAssets[]>
  >({
    [CatalogueCategory.Featured]: [],
    [CatalogueCategory.New]: [],
    [CatalogueCategory.Free]: [],
  });

  const getCatalogue = useCallback(async (category: CatalogueCategory) => {
    try {
      setCurrentCatalogueCategory(category);
      setIsLoading(true);

      const sources = (await levelDBService.values(
        "downloadSources"
      )) as DownloadSource[];
      const downloadSources = orderBy(sources, "createdAt", "desc");

      const params = {
        take: 12,
        skip: 0,
        downloadSourceIds: downloadSources.map((source) => source.id),
      };

      const catalogue = await window.electron.hydraApi.get<ShopAssets[]>(
        `/catalogue/${category}`,
        {
          params,
          needsAuth: false,
        }
      );

      setCatalogue((prev) => ({ ...prev, [category]: catalogue }));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getRandomGame = useCallback(() => {
    window.electron.getRandomGame().then((game) => {
      if (game) setRandomGame(game);
    });
  }, []);

  const handleRandomizerClick = () => {
    if (randomGame) {
      navigate(
        buildGameDetailsPath(
          { ...randomGame, shop: "steam" },
          {
            fromRandomizer: "1",
          }
        )
      );
    }
  };

  const handleCategoryClick = (category: CatalogueCategory) => {
    if (category !== currentCatalogueCategory) {
      getCatalogue(category);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    getCatalogue(CatalogueCategory.Featured);

    getRandomGame();
  }, [getCatalogue, getRandomGame]);

  const categories = Object.values(CatalogueCategory);

  return (
    <SkeletonTheme baseColor="#1c1c1c" highlightColor="#444">
      <section className="home__content">
        <Hero />

        <section className="home__header">
          <div className="home__store-intro">
            <span className="home__store-eyebrow">{t("store_eyebrow")}</span>
            <h2>{t("store_title")}</h2>
            <p>{t("store_description")}</p>
          </div>

          <ul className="home__buttons-list">
            {categories.map((category) => (
              <li key={category}>
                <Button
                  theme={
                    category === currentCatalogueCategory
                      ? "primary"
                      : "outline"
                  }
                  onClick={() => handleCategoryClick(category)}
                >
                  <span className="home__category-emoji" aria-hidden="true">
                    {categoryEmoji[category]}
                  </span>
                  {t(category)}
                </Button>
              </li>
            ))}
          </ul>

          <Button
            onClick={handleRandomizerClick}
            theme="outline"
            disabled={!randomGame}
          >
            <div className="home__icon-wrapper">
              <img
                src={starsIconAnimated}
                alt=""
                className="home__stars-icon"
              />
            </div>
            {t("surprise_me")}
          </Button>
        </section>

        <h2 className="home__title">
          <span className="home__title-emoji" aria-hidden="true">
            {categoryEmoji[currentCatalogueCategory]}
          </span>
          {t(currentCatalogueCategory)}
        </h2>

        <section className="home__cards">
          {isLoading
            ? Array.from({ length: 12 }).map((_, index) => (
                <Skeleton key={index} className="home__card-skeleton" />
              ))
            : catalogue[currentCatalogueCategory].map((result) => (
                <GameCard
                  key={result.objectId}
                  game={result}
                  onClick={() => navigate(buildGameDetailsPath(result))}
                />
              ))}
        </section>
      </section>
    </SkeletonTheme>
  );
}
