// src/app/core/auth.service.ts
import { Injectable, inject } from '@angular/core';
import {
  signIn,
  signUp,
  confirmSignUp,
  resendSignUpCode,
  signOut,
  getCurrentUser,
  type SignInInput,
} from 'aws-amplify/auth';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AwsService } from './aws.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSubject = new BehaviorSubject<any>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private awsService = inject(AwsService);

  constructor() {
    // Don't check auth status immediately - wait for initialization
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      // Wait for AWS to be initialized
      if (!this.awsService.isInitialized()) {
        await this.awsService.initialize();
      }
      
      // Now check auth status
      await this.checkAuthStatus();
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      this.userSubject.next(null);
      this.isAuthenticatedSubject.next(false);
    }
  }

  // Get current auth status
  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  // Get current user
  currentUser(): Observable<any> {
    return this.userSubject.asObservable();
  }

  // Sign up
  signUp(email: string, password: string, name: string): Observable<any> {
    return from(
      signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name,
          },
        },
      }),
    ).pipe(
      map((result) => {
        // The sign up result will include isSignUpComplete which tells us if confirmation is needed
        return result;
      }),
    );
  }

  confirmSignUp(email: string, code: string): Observable<any> {
    return from(
      confirmSignUp({
        username: email,
        confirmationCode: code,
      }),
    );
  }

  resendConfirmationCode(email: string): Observable<any> {
    return from(
      resendSignUpCode({
        username: email,
      }),
    );
  }

  // Sign in
  signIn(email: string, password: string): Observable<any> {
    return from(
      signIn({
        username: email,
        password,
      }),
    ).pipe(
      tap((user) => {
        this.userSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      }),
    );
  }

  // Sign out
  signOut(): Observable<any> {
    return from(signOut()).pipe(
      tap(() => {
        this.userSubject.next(null);
        this.isAuthenticatedSubject.next(false);
      }),
    );
  }

  // Check auth status on app load
  private async checkAuthStatus() {
    try {
      const user = await getCurrentUser();
      this.userSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    } catch {
      this.userSubject.next(null);
      this.isAuthenticatedSubject.next(false);
    }
  }
}
