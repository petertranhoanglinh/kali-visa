import { Component, OnInit } from '@angular/core';
import { AutologoutService } from 'src/app/service/auth.autologut';

@Component({
  selector: 'app-auto-login',
  templateUrl: './auto-login.component.html',
  styleUrls: ['./auto-login.component.css']
})
export class AutoLoginComponent implements OnInit {

  constructor(private autoLogin:AutologoutService) { }

  ngOnInit(): void {
  }

}
