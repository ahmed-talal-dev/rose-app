import { useTranslations } from "next-intl";

export default function HomePage() {
    const t = useTranslations("common");

    return (
        <main>
            <h1>{t("loading")}</h1>
        </main>
    );
}
