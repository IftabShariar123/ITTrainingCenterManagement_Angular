import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  persons = [
    { name: 'A.N. Shuvo', position: 'Backend', img: 'images/testimonials/Shuvo.PNG' },
    { name: 'Md. Saiful', position: 'Backend & Frontend', img: 'images/testimonials/Saiful.PNG' },
    { name: 'Shahida', position: 'Backend & Frontend', img: 'images/testimonials/Capture.PNG' },
    { name: 'Shariar', position: 'Backend', img: 'images/testimonials/Iftab Shariar Niloy.....id--1285326.jpg' }
  ];

  // Duplicate the array to create seamless looping
  duplicatedPersons = [...this.persons, ...this.persons];

  animatedElements: boolean[] = [];

  ngOnInit() {
    // Initialize animation states
    this.animatedElements = new Array(6).fill(false);
    this.checkScroll();
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    this.checkScroll();
  }

  checkScroll() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((el, index) => {
      const position = el.getBoundingClientRect();
      if (position.top < window.innerHeight * 0.85) {
        this.animatedElements[index] = true;
      }
    });
  }

 

}
