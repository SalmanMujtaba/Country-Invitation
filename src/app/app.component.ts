import { Component } from '@angular/core';
// Problem Statement
// https://leetcode.com/discuss/interview-question/809995/hubspot-oa-sessions
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'hubSpot';
  session: Array<any> = [];
  sessionsByUser = {};;
  data = {
    "events": [
      {
        "url": "/pages/a-big-river",
        "visitorId": "d1177368-2310-11e8-9e2a-9b860a0d9039",
        "timestamp": 1512754583000
      },
      {
        "url": "/pages/a-small-dog",
        "visitorId": "d1177368-2310-11e8-9e2a-9b860a0d9039",
        "timestamp": 1512754631000
      },
      {
        "url": "/pages/a-big-talk",
        "visitorId": "f877b96c-9969-4abc-bbe2-54b17d030f8b",
        "timestamp": 1512709065294
      },
      {
        "url": "/pages/a-sad-story",
        "visitorId": "f877b96c-9969-4abc-bbe2-54b17d030f8b",
        "timestamp": 1512711000000
      },
      {
        "url": "/pages/a-big-river",
        "visitorId": "d1177368-2310-11e8-9e2a-9b860a0d9039",
        "timestamp": 1512754436000
      },
      {
        "url": "/pages/a-sad-story",
        "visitorId": "f877b96c-9969-4abc-bbe2-54b17d030f8b",
        "timestamp": 1512709024000
      }
    ]
  }
  mapp = new Map();
  constructor() {

    this.createMap();
    this.processData();
    this.finalOutput()
  }

  createMap() {
    for (let value of this.data.events) {
      if (this.mapp.has(value.visitorId)) {
        let inner = this.mapp.get(value.visitorId);
        this.mapp.set(value.visitorId, inner.set(value.timestamp, value));
      } else {
        this.mapp.set(value.visitorId, new Map([[value.timestamp, value]]));
      }
    }
  }

  processData() {
    for (let [key, value] of this.mapp) {
      let sortedTimeStamp = [...value].sort((a, b) => a[0] - b[0]);
      for (let index = 0; index < sortedTimeStamp.length; index++) {
        const [t, d] = sortedTimeStamp[index];
        if (index === 0) {
          this.session[d.visitorId] = [
            {
              duration: [t],
              pages: [d.url],
              startTime: t
            }
          ];
          continue;
        }
        const [t0, d0] = sortedTimeStamp[index - 1];
        if (t - t0 < 10 * 60 * 1000) {
          let length = this.session[d.visitorId].length;
          this.session[d.visitorId][length - 1].duration.push(t);
          this.session[d.visitorId][length - 1].pages.push(d.url);
        } else {
          this.session[d.visitorId].push({
            duration: [t],
            pages: [d.url],
            startTime: t
          });
        }
      }
    }

  }

  finalOutput() {
    for (let v of Object.keys(this.session)) {
      for (let innerv of this.session[v]) {
        if (innerv.duration.length === 1) {
          innerv.duration = 0;
        } else {
          innerv.duration = innerv.duration[innerv.duration.length - 1] - innerv.startTime;
        }
      }
    }
    this.sessionsByUser = { ...this.session };
  }
}

