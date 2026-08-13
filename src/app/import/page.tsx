import { ImportWizard } from "./import-wizard";

export default function ImportPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Import Data</h1>
        <p className="text-sm text-muted-foreground">
          Bring in employee and roster data from Excel or CSV. Everything can still be edited by hand afterwards.
        </p>
      </div>
      <ImportWizard />
    </div>
  );
}
