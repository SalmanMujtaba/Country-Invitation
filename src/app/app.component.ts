import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { ApiService } from './api.service';
import { ICountry } from './models/country.model';
import { IPartner } from './models/partner.model';



// Please use: npm install followed by ng serve to run the project.
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'hubSpot';
  data: Array<IPartner>;
  countries: Array<ICountry> = [];
  uniqueCountries: Set<string>;
  // country => partners
  countryMap;
  // This stores the partners based on the date for a country.
  // country => date => partners
  // this could be improved may be to store less data.
  partnerMapAsPerDay;
  constructor(protected http: HttpClient, protected apiService: ApiService) {
    this.data = [];
    this.countries = [];
    this.uniqueCountries = new Set();
    // country => partners
    this.countryMap = new Map();
    this.partnerMapAsPerDay = new Map();
  }
  ngOnInit(): void {
    this.apiService.getData().subscribe(data => {
      this.data = data['partners'];
      this.getCountryWiseData();
      this.populatePartnerMapAsPerDayForCountry();
      this.manageDatesForPartnerMapAsPerDayForCountry();
      this.populateCountries();
      this.apiService.postData([...this.countries]).subscribe(data => console.log(data));
    });
  }

  getCountryWiseData() {
    let partners = this.data;
    for (let index = 0; index < partners.length; index++) {
      this.uniqueCountries.add(partners[index]['country']);
      let country = partners[index]['country'];
      // Get ONLY the start dates of the consecutive dates. If it does not exist, we will get an empty array.
      let dates: Array<string> = this.checkConsecutive(partners[index]['availableDates']) as Array<string>;
      // Check if there exists consecutive dates.
      if (dates.length > 0) {
        partners[index]['availableDates'] = dates;
        // Populate the country map as "country" => partners for that country.
        if (!this.countryMap.has(country)) {
          let arr = [];
          arr.push(partners[index]);
          this.countryMap.set(country, arr);
        } else {
          let arr = this.countryMap.get(country);
          arr.push(partners[index]);
        }
      }
    }
  }

  checkConsecutive(dates: Array<string>) {
    let tempDates = new Set(); // Set to make sure we are only storing unique dates.
    if (dates.length < 2) return [];
    for (let index = 1; index < dates.length; index++) {
      let prev = moment(dates[index - 1]);
      let cur = moment(dates[index]);
      if (cur.diff(prev, 'days') === 1) {
        tempDates.add(dates[index - 1]);
      }
    }
    // Obtain the consecutive dates. (Only the start date)
    return Array.from(tempDates);

  }

  populatePartnerMapAsPerDayForCountry() {
    for (let [country, partners] of this.countryMap) {
      let partnerMapAsPerDay = new Map();
      for (let partnerItem of partners) {
        let dates = partnerItem['availableDates'];
        for (let dateItem of dates) {
          if (partnerMapAsPerDay.has(dateItem)) {
            let arr = partnerMapAsPerDay.get(dateItem);
            arr.push(partnerItem);
          } else {
            let arr = [];
            arr.push(partnerItem);
            partnerMapAsPerDay.set(dateItem, arr);
          }
        }
      }
      this.partnerMapAsPerDay.set(country, partnerMapAsPerDay);
    }
  }

  manageDatesForPartnerMapAsPerDayForCountry() {
    let maxCountryPartners: any = {}; // Object to store the max length of the partners available for a country.
    let maxLength = 0;
    for (let [country, datePartners] of this.partnerMapAsPerDay) {
      for (let [date, partners] of datePartners) {
        maxLength = Math.max(maxLength, partners.length);
      }
      maxCountryPartners[country] = maxLength;
      maxLength = 0;
    }
    // Delete partners for a country, for a date, which are lesser than the maximum partners available for that country for that date.
    for (let [country, datePartners] of this.partnerMapAsPerDay) {
      for (let [date, partners] of datePartners) {
        if (partners.length !== maxCountryPartners[country]) {
          this.partnerMapAsPerDay.get(country).delete(date);
        }
      }
    }

    // Only retain the the earler date for a country cause there could be more than one date with the same number of partners.
    for (let [country, datePartners] of this.partnerMapAsPerDay) {
      let tempVariable = 1; // a variable to ensure that we delete anything other than the earliest date.
      for (let [date, partners] of datePartners) {
        if (tempVariable > 1) {
          this.partnerMapAsPerDay.get(country).delete(date);
        }
        tempVariable++;
      }
    }
  }

  populateCountries() {
    let obj: ICountry = {} as ICountry;
    for (let [country, datePartners] of this.partnerMapAsPerDay) {
      for (let [date, partners] of datePartners) {
        let attendees = [];
        for (let i = 0; i < partners.length; i++) {
          attendees.push(partners[i]['email']);
        }
        obj = {
          attendeeCount: attendees.length,
          attendees,
          "name": country,
          "startDate": date
        }
      }
      this.countries.push(obj);
    }
    for (let country of this.countries) {
      if (this.uniqueCountries.has(country.name)) {
        this.uniqueCountries.delete(country.name);
      }
    }
    // Add the countries with null start date.
    if (this.uniqueCountries.size > 0) {
      for (let country of this.uniqueCountries) {
        let obj: any = {};
        obj = {
          attendeeCount: 0,
          attendees: [],
          "name": country,
          "startDate": null
        }
        this.countries.push(obj);
      }
    }
  }
}
