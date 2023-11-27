import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  isOpen : boolean = false;

  menuInteraction() {
    this.isOpen = this.isOpen ? false : true;
  }
}
