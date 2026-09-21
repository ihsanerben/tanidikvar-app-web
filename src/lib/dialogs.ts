export type DialogRequest = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
  input?: { label: string; initialValue?: string; minLength?: number; maxLength?: number };
  resolve: (value: boolean | string | null) => void;
};

export function confirmDialog(message:string,options:Omit<DialogRequest,"message"|"resolve"|"input">={title:"Onay gerekiyor"}) {
  return new Promise<boolean>(resolve=>window.dispatchEvent(new CustomEvent<DialogRequest>("app:dialog",{detail:{...options,message,resolve:value=>resolve(value===true)}})));
}

export function promptDialog(message:string,options:Omit<DialogRequest,"message"|"resolve"> & {input:NonNullable<DialogRequest["input"]>}) {
  return new Promise<string|null>(resolve=>window.dispatchEvent(new CustomEvent<DialogRequest>("app:dialog",{detail:{...options,message,resolve:value=>resolve(typeof value==="string"?value:null)}})));
}
