import playwright from "playwright"
import { parse, isPast } from "date-fns"
import { sendEmail } from "./mailer.ts"
import { CronJob } from "cron"

// Variable global para el navegador
let browser: playwright.Browser

async function initBrowser() {
  try {
    browser = await playwright.chromium.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      chromiumSandbox: false,
    })
    console.log("Navegador iniciado exitosamente")
  } catch (error) {
    console.error("Error al iniciar el navegador:", error)
    process.exit(1)
  }
}

async function main() {
  if (!browser) {
    console.log("Reiniciando el navegador...")
    await initBrowser()
  }

  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    await page.goto(
      "https://www.cgeonline.com.ar/informacion/apertura-de-citas.html"
    )
    const table = page.locator("table")
    const passportRow = table
      .getByText("renovación y primera vez")
      .locator("..")
      .locator("..")
      .locator("td:nth-child(3)")
    const textDate = await passportRow.innerText()

    const [date, time] = textDate.split(" a las ")
    const parsedDate = parse(`${date} ${time}`, "dd/MM/yyyy HH:mm", new Date())

    console.log("Fecha encontrada:", parsedDate)
    if (!isPast(parsedDate)) {
      sendEmail({
        to: [
          { email: "alejandraagibert@gmail.com", name: "Alejandra" },
          {
            email: "lukaliuzzi@gmail.com",
            name: "Luka",
          },
        ],
        subject: "PASAPORTEEEE!!!!! 🎉 ENTRA RAPIDO!",
        htmlContent: `Hay fecha disponible para sacar turno en la CGE el día ${date} a las ${time}.
            Entra rapidooooo: <a href="https://www.cgeonline.com.ar/informacion/apertura-de-citas.html">https://www.cgeonline.com.ar/informacion/apertura-de-citas.html</a>`,
      })
    }
  } catch (error) {
    console.error("Error durante la ejecución:", error)
  } finally {
    await page.close()
    await context.close()
  }
}

// Iniciar el navegador antes del cronjob
initBrowser().then(() => {
  const job = new CronJob(
    "*/30 * * * *", // Cada 30 minutos
    main, // Función a ejecutar
    null, // onComplete
    true, // Start inmediatamente
    "America/Argentina/Buenos_Aires" // Timezone
  )

  job.start()
  console.log("Cronjob iniciado")
})

// Manejar el cierre de la aplicación
process.on("SIGINT", async () => {
  if (browser) {
    console.log("Cerrando el navegador...")
    await browser.close()
  }
  process.exit(0)
})
