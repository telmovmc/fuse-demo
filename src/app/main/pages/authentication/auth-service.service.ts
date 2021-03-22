import { CookieService } from 'ngx-cookie-service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router'

@Injectable({
  providedIn: 'root'
})

export class AuthServiceService {

  baseUrl = 'api/users';
  user: User | null;

  constructor(
    private http: HttpClient, 
    private _router: Router, 
    private _cookieService: CookieService
    ) {

      var id = +this._cookieService.get('Id');
      var email = this._cookieService.get('Email');
      var password = this._cookieService.get('Password');
      if(id && email && password) this.user = {id, email, password};

    }

  private getUser = (email: string): Observable<User[]> => 
    this.http.get<User[]>(`${this.baseUrl}/?email=${encodeURIComponent(email)}`)
  
  public isLoggedIn = (): boolean => 
    !!this.user;
  
  
  public login(email: string, password: string): boolean 
  {
    var loginAccepted = false;
    this.getUser(email)
      .subscribe((users: User[]) => {

        if(!users[0]) return;
        if(users[0].password != password) return;

        this.user = users[0]; 
        this._cookieService.set('Id', this.user.id.toString(), 365, '/');
        this._cookieService.set('Email', this.user.email, 365, '/');
        this._cookieService.set('Password', this.user.password, 365, '/');
        loginAccepted = true;
      })
      
    return loginAccepted;  
  }

  public logout(): void 
  {
    this.user = null;
    this._cookieService.deleteAll('/');
    this._router.navigate(['pages/auth/login-2']);
  }
}
