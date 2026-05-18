const StudentOutreachCard = () => {
  return (
    <div className="h-full overflow-hidden rounded-xl border bg-background shadow-sm">
      <div className="border-b bg-linear-to-r from-primary/5 to-primary/10 px-6 py-4">
        <h2 className="text-lg font-semibold">Outreach</h2>
      </div>

      <div className="p-6 text-center text-muted-foreground">
        <p className="text-sm">Outreach information will appear here</p>
      </div>
    </div>
  );
};

export default StudentOutreachCard;
