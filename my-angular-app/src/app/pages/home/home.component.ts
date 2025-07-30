import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

interface Shape {
  type: string;
  x: number;
  y: number;
  delay: number;
  color: string;
  duration: number;
}

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    MatButtonModule,
    RouterModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  shapes: Shape[] = [];

  ngOnInit() {
    this.generateRandomShapes();
  }

  private generateRandomShapes() {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    
    const shapeTypes = ['circle', 'square', 'triangle'];
    
    for (let i = 0; i < 15; i++) {
      this.shapes.push({
        type: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: 3 + Math.random() * 4
      });
    }
  }
}
