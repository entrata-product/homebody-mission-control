import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

// Labs CI sets VITE_LABS_DEPLOY=true for relative assets under entrata-labs/{slug}/
const labsDeploy = process.env.VITE_LABS_DEPLOY === "true"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.VITE_BASE_PATH ?? (labsDeploy ? "./" : "/homebody-mission-control/"),
})
