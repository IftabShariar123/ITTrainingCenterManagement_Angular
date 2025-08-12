import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Offer } from '../Models/offer';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OfferService {

  private apiUrl = environment.apiBaseUrl;

  constructor() { }

  http = inject(HttpClient);

  getAllOffers(): Observable<Offer[]> {
    //return this.http.get<Offer[]>(`${this.apiUrl}/Offer/GetOffers`);

    return this.http.get<Offer[]>(this.apiUrl + "/Offer/GetOffers");

  }

  getActiveOffers(): Observable<Offer[]> {
    return this.http.get<Offer[]>(this.apiUrl + "/Offer/GetActiveOffers");

  }

  getOfferById(id: number): Observable<Offer> {
    return this.http.get<Offer>(this.apiUrl + "/Offer/GetOffer" + id);
  }

  addOffer(offer: Offer): Observable<any> {
    //return this.http.post(`${this.apiUrl}/Offer/CreateOffer`, offer);

    return this.http.post(this.apiUrl + "/Offer/InsertOffer", offer);

  }

  updateOffer(offer: Offer): Observable<any> {
    //return this.http.put(`${this.apiUrl}/Offer/UpdateOffer/${offer.offerId}`, offer);

    return this.http.put(this.apiUrl + "/Offer/UpdateOffer/" + offer.offerId, offer)

  }

  deleteOffer(id: number): Observable<any> {
    //  return this.http.delete(`${this.apiUrl}/Offer/DeleteOffer/${id}`);

    return this.http.delete(this.apiUrl + "/Offer/DeleteOffer/" + id);
  }

  // Additional methods based on your business requirements
  getOffersByType(type: string): Observable<Offer[]> {
    return this.http.get<Offer[]>(this.apiUrl + "/Offer/GetOffersByType" + type);
  }

  getValidOffers(currentDate: Date = new Date()): Observable<Offer[]> {
    return this.http.get<Offer[]>(`${this.apiUrl}/Offer/GetValidOffers?currentDate=${currentDate.toISOString()}`);
  }
}
