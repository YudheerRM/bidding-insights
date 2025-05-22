const config = {
    env: {
        apiEndpoint: process.env.NEXT_PUBLIC_API_ENDPOINT!,
        prodApiEndpoint: process.env.NEXT_PUBLIC_PROD_API_ENDPOINT!,
        databaseUrl: process.env.DATABASE_URL!,
        resendToken: process.env.RESEND_TOKEN!,
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000', 
        upstash: {
            redisURL: process.env.UPSTASH_REDIS_REST_URL!,
            redisToken: process.env.UPSTASH_REDIS_REST_TOKEN!,
            qstashUrl: process.env.QSTASH_URL!,
            qstashToken: process.env.QSTASH_TOKEN!,
        }
    },
};

export default config;