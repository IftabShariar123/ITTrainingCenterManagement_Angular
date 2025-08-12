import { AdmissionDetail } from "./admission-detail";

export interface Admission {
  admissionId: number;
  admissionNo?: string;
  remarks?: string;
  visitorId: number;
  organizationName?: string;
  offerId?: number;
  discountAmount?: number;
  admissionDate: Date;
  admissionDetails: AdmissionDetail[];
}
export interface Offer {
  offerId: number;
  offerName: string;

}


