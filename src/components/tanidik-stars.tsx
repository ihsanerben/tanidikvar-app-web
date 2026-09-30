export function tanidikStarCount(educationStatus?: string | null) {
  return educationStatus === "MEZUN" ? 3 : educationStatus === "UNIVERSITE_OGRENCISI" ? 2 : 1;
}

export function TanidikStars({ educationStatus }: { educationStatus?: string | null }) {
  const count = tanidikStarCount(educationStatus);
  return <i data-star-count={count} aria-label={`${count} yıldız`} />;
}
