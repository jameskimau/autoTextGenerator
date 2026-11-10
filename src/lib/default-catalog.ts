import type { Catalog, CatalogItem } from "./types";

const item = (id: string, label: string): CatalogItem => ({
  id,
  label,
  savedQuestions: [],
});

export const DEFAULT_CATALOG: Catalog = {
  intro: "เอกสารส่วนที่ส่งมาทางไลน์ขอส่งใหม่ผ่านอีเมล์เท่านั้นนะครับ",
  sections: [
    {
      id: "applicant-info",
      title: "ข้อมูลของ{applicant}",
      defaultNote: "ขอส่งมาก่อน",
      items: [
        item("info-father-province", "จังหวัดเกิดของ คุณพ่อ"),
        item("info-mother-province", "จังหวัดเกิดของ คุณแม่"),
        item("info-older-brother-province", "จังหวัดเกิดของ พี่ชาย"),
        item("info-younger-brother-province", "จังหวัดเกิดของ น้องชาย"),
        item("info-stepmother-province", "จังหวัดเกิดของแม่เลี้ยง"),
      ],
    },
    {
      id: "applicant-docs",
      title: "เอกสารของ{applicant}",
      defaultNote: "ขอส่งมาก่อน",
      items: [
        item("app-birth-cert", "รูปภาพ ใบเกิด (ขอชัดๆ นะครับ)"),
        item("app-name-change", "รูปภาพใบเปลี่ยนชื่อ"),
        item("app-thai-passport", "Thai Passport"),
        item("app-thai-id", "บัตรประชาชนไทย"),
        item("app-military", "ใบผ่านเกณฑ์ทหาร สด8 หรือ 9"),
        item("app-house-reg", "ทะเบียนบ้าน หน้าแรกและหน้าที่มีชื่อเรา"),
        item("app-nsw-licence", "NSW Driver Licence"),
        item("app-child-birth-cert", "ใบเกิดลูก"),
      ],
    },
    {
      id: "sponsor-docs",
      title: "เอกสาร{sponsor}",
      defaultNote: "ขอส่งมาก่อน",
      items: [
        item("sp-thai-passport", "Thai Passport"),
        item("sp-au-passport", "Australian Passport"),
        item("sp-thai-id", "บัตรประชาชนไทย"),
        item("sp-nsw-licence", "NSW Driver Licence"),
      ],
    },
    {
      id: "relationship",
      title: "หลักฐานความสัมพันธ์",
      defaultNote: "เอามาวันอังคารได้ครับ",
      items: [
        item("rel-applicant-address", "หลักฐานที่อยู่{applicant} 10 ชิ้น +"),
        item("rel-sponsor-address", "หลักฐานที่อยู่{sponsor} 10 ชิ้น +"),
        item("rel-joint-bank", "Joint Bank Statement ทั้งหมดตั้งแต่เปิด บช"),
        item(
          "rel-photos",
          "ภาพความสัมพันธ์ 15 รูป ทุกรูปต้อง 1 ระบุวันที่ถ่าย+อธิบายเหตุการณ์ 1 ประโยค+ชื่อสถานที่ๆ ถ่าย",
        ),
        item(
          "rel-timeline",
          "กรอกลำดับความสัมพันธ์ในไฟล์แนบมาให้ละเอียดครับ สำคัญมาก",
        ),
      ],
    },
  ],
};
