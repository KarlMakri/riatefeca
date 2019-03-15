import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private http: HttpClient) { }

  ngOnInit() {
  }


  login(email,password){

    let body = {email:email, password:password};

     this.http.post("http://localhost:8080/lunchtimeng /login", body)
         .subscribe(
             res => console.log(res),
             error => console.log(error)
         )
 }

}
