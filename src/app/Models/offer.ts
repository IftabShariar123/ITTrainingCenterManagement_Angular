export interface Offer { 
  offerId: number;
  offerName: string;
  description: string;
  offerType: 'Seasonal' | 'Occasional' | 'PaymentBased' | string; // Enumerable type with fallback
  seasonOrOccasion?: string;
  validFrom: Date | string; // Can handle both Date object and ISO string
  validTo: Date | string;
  discountPercentage: number;
  paymentCondition?: string;
  isActive: boolean;
  //admissions?: Admission[]; // Assuming you have an Admission interface
  remarks?: string;
}

