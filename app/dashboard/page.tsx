import { redirect } from "next/navigation";

/** La ruta vieja del homebanking. Se mantiene por los links ya compartidos. */
export default function DashboardRedirect() {
  redirect("/inicio");
}
