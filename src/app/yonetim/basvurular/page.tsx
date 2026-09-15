import {ApplicationsPage} from "@/manager-legacy/pages";
import {EducationReviewConsole} from "@/components/education-review-console";
export const metadata={title:"Tanıdık başvuruları",robots:{index:false,follow:false}};
export default function Page(){return <><ApplicationsPage manager/><div className="manager-extension"><EducationReviewConsole/></div></>;}
