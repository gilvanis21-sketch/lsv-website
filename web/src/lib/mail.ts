import nodemailer from "nodemailer";

let transport: ReturnType<typeof nodemailer.createTransport> | undefined;
function getTransport() {
  transport ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "localhost",
    port: Number(process.env.SMTP_PORT ?? 1025),
    secure: false,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
  });
  return transport;
}

const FROM = () => process.env.MAIL_FROM ?? "LSV <no-reply@localhost>";
const SITE_URL = () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const TYPE_LABEL = { premiere_consultation: "Première consultation", suivi: "Suivi" } as const;

type Req = { ref: string; firstName: string; lastName: string; email: string; type: keyof typeof TYPE_LABEL; preferredDate?: string | null; preferredSlot?: string | null };

/** E-mails en texte brut uniquement (pas de HTML = pas d'injection de contenu). */
export async function sendAdminNotification(r: Req) {
  const to = process.env.ADMIN_NOTIFY_EMAIL;
  if (!to) return;
  await getTransport().sendMail({
    from: FROM(),
    to,
    subject: `Nouvelle demande de rendez-vous ${r.ref}`,
    text: [`Une nouvelle demande vient d'être reçue.`, ``, `Référence : ${r.ref}`, `Type : ${TYPE_LABEL[r.type]}`, ``, `Consulter : ${SITE_URL()}/admin/demandes`, ``, `(Les coordonnées ne sont pas reprises dans cet e-mail : connectez-vous à l'espace d'administration.)`].join("\n"),
  });
}

export async function sendRequesterConfirmation(r: Req) {
  await getTransport().sendMail({
    from: FROM(),
    to: r.email,
    subject: `Votre demande de rendez-vous ${r.ref} a bien été reçue`,
    text: [
      `Bonjour ${r.firstName},`,
      ``,
      `Nous avons bien reçu votre demande de rendez-vous (référence ${r.ref}).`,
      `Type de demande : ${TYPE_LABEL[r.type]}`,
      r.preferredDate ? `Créneau souhaité : ${r.preferredDate}${r.preferredSlot && r.preferredSlot !== "indifferent" ? ` (${r.preferredSlot === "matin" ? "matin" : "après-midi"})` : ""}` : ``,
      ``,
      `IMPORTANT : il s'agit d'une demande, pas d'une réservation. Le rendez-vous n'est confirmé qu'après validation du créneau par le laboratoire, qui vous recontactera.`,
      ``,
      `Vos données servent uniquement à traiter votre demande. Pour exercer vos droits (accès, suppression), indiquez votre référence ${r.ref} dans votre message.`,
      ``,
      `Laboratoire Scientifique de la Voix`,
    ].filter((l) => l !== undefined).join("\n"),
  });
}
