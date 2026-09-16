import type { MetadataRoute } from "next";
import { getCatalogOverview, getCatalogPrograms, getUniversities, getUniversityDepartments } from "@/lib/api/catalog";
import { getQuestions, type QuestionItem } from "@/lib/api/questions";
import { getTanidiklar, type PublicTanidik } from "@/lib/api/profiles";
import { catalogSegment, questionSegment } from "@/lib/public-url";

async function allQuestions() {
  const first = await getQuestions("", 0, { size: 100 });
  const items: QuestionItem[] = [...first.items];
  for (let page = 1; page < Math.ceil(first.totalElements / first.size); page++) items.push(...(await getQuestions("", page, { size: 100 })).items);
  return items;
}

async function allPeople() {
  const first = await getTanidiklar("", 0, { size: 100 });
  const items: PublicTanidik[] = [...first.items];
  for (let page = 1; page < Math.ceil(first.totalElements / first.size); page++) items.push(...(await getTanidiklar("", page, { size: 100 })).items);
  return items;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:5173";
  const paths = ["", "/universiteler", "/programlar", "/istatistikler", "/sorular", "/tanidiklar", "/karsilastir", "/siralama"];
  try {
    const first = await getUniversities({ size: 100 });
    const universities = [...first.items];
    for (let page = 1; page < Math.ceil(first.totalElements / first.size); page++) universities.push(...(await getUniversities({ page, size: 100 })).items);
    const [questions, people, firstPrograms,overview] = await Promise.all([allQuestions(), allPeople(), getCatalogPrograms({size:100}),getCatalogOverview()]);
    const catalogPrograms=[...firstPrograms.items];
    for(let page=1;page<Math.ceil(firstPrograms.totalElements/firstPrograms.size);page++)catalogPrograms.push(...(await getCatalogPrograms({page,size:100})).items);
    for (const university of universities) {
      const universityPath = `/universite/${catalogSegment(university.name, university.id)}`;
      paths.push(universityPath);
      const programs = await getUniversityDepartments(university.id);
      programs.forEach(program => paths.push(`${universityPath}/${catalogSegment(program.departmentName, program.departmentId)}`));
    }
    questions.forEach(question => paths.push(`/soru/${questionSegment(question.title, question.id)}`));
    people.forEach(person => paths.push(`/tanidik/${person.id}`));
    catalogPrograms.forEach(program=>paths.push(`/program/${program.id}`));
    overview.cities.filter(city=>city.label!=="Belirtilmemiş").forEach(city=>paths.push(`/sehir/${encodeURIComponent(city.label)}`));
  } catch { /* API unavailable: static discovery URLs remain valid. */ }
  return [...new Set(paths)].map(path => ({ url: `${site}${path}`, changeFrequency: path.startsWith("/soru/") ? "weekly" : "daily", priority: path ? 0.8 : 1 }));
}
