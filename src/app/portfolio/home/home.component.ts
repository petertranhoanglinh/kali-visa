import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthDetail } from 'src/app/common/util/auth-detail';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
    if(AuthDetail.isLogin()) {
      this.router.navigate(['/dashboard']);
    }
  }

}
