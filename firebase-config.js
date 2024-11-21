import dotenv from "dotenv"

dotenv.config()

export const config = {
    type: "service_account",
    project_id: process.env.PROJECT_ID,
    private_key_id: process.env.PROJECT_KEY_ID,
    private_key: process.env.PROJECT_PRIVATE_KEY,
    client_email: process.env.PROJECT_CLIENT_EMAIL,
    client_id: process.env.PROJECT_CLIENT_ID,
    auth_uri: process.env.PROJECT_AUTH_URI,
    token_uri: process.env.PROJECT_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.PROJECT_AUTH_PROVIDER_x509_CERT_URL,
    client_x509_cert_url: process.env.PROJECT_CLIENT_x509_CERT_URL,
    universe_domain: process.env.UNIVERSE_DOMAIN
}