"use client";

import { startTransition, type ComponentProps, type FormEvent } from "react";

type FormAction = (fd: FormData) => void | Promise<void>;

/**
 * React 19 posle SVAKOG slanja vraća formular na početne vrednosti, i kada server vrati grešku.
 * Posledice u adminu: posle „Preklapa se sa terminom…“ nestanu ime, telefon i beleška, a doktor i
 * vreme se vrate na početne; posle čuvanja padajuća lista (npr. „Na upit“) prikaže staru vrednost,
 * pa je sledeće čuvanje tiho vrati u bazu. Ovde formular šaljemo sami, bez tog vraćanja.
 * `action` ostaje na formularu: radi i pre nego što se JavaScript učita (obično slanje).
 */
export function keepOnSubmit(action: FormAction) {
  return (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter;
    const fd = new FormData(e.currentTarget, submitter);
    startTransition(() => action(fd));
  };
}

/** Formular za izmenu postojećih podataka: posle slanja polja zadržavaju ono što je upisano. */
export function KeepForm({ action, ...rest }: Omit<ComponentProps<"form">, "action" | "onSubmit"> & { action: FormAction }) {
  return <form action={action} onSubmit={keepOnSubmit(action)} {...rest} />;
}
