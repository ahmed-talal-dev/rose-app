import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            // {
            //     protocol: "https",
            //     hostname: "flagcdn.com",
            // },
            {
                protocol: "https",
                hostname: "rose-app.elevate-bootcamp.cloud",
            },
            {
                protocol: "https",
                hostname: "www.rose-app.elevate-bootcamp.cloud",
            },
            {
                protocol: "https",
                hostname: "randomuser.me",
            },
        ],
    },
};

export default withNextIntl(nextConfig);