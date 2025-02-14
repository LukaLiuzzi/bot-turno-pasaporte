import mailjet from "node-mailjet"

process.loadEnvFile()

const mailer = new mailjet({
  apiKey: process.env.MAIL_API_KEY || "",
  apiSecret: process.env.MAIL_API_SECRET || "",
})

interface EmailOptions {
  to: { email: string; name: string }[]
  subject: string
  htmlContent: string
  fromEmail?: string
  fromName?: string
}

export async function sendEmail({
  to,
  subject,
  htmlContent,
  fromEmail = "lukaliuzzidev@gmail.com",
  fromName = "Luka Liuzzi",
}: EmailOptions): Promise<any> {
  try {
    const request = await mailer.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: fromEmail,
            Name: fromName,
          },
          To: to.map((recipient) => ({
            Email: recipient.email,
            Name: recipient.name,
          })),
          Subject: subject,
          HTMLPart: htmlContent,
        },
      ],
    })

    return request.body
  } catch (error) {
    console.error("Error sending email:", error)
    throw error
  }
}
