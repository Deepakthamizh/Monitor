/*var price=100;
var Product=200;
var Tax=10;

console.log("Bewakoof Shirt", "Total =", price+Tax)

let productName = 'shirt';

console.log(productName, 'Total =', price+Tax);

var priice=100;
var product="iPhone";
var tax=20;

console.log(product);
console.log("total =", priice+tax);

var productPrice=113010;
var prodName="iPhone";
var tax=0.10*productPrice;
var total = productPrice+tax;

console.log(total);

//fruitname is apple defining here 
var FruitName = "Apple";
var count = 100;
var Price = 10;
var total1 = count*10;

console.log(FruitName);
console.log(total1);*/

function abc() {
  var a = "Hello World";
  console.log(a);
}

abc()

function phone() {
  var a="iphone";
  var b="samsung";
  var c="redmi"

  console.log(a,b,c);
}

phone()

var a = 10;
var b = 20;

function addition() {
  total = (a+b);
  console.log(total);
}

addition()

var factor = "vijay";
var fplayer = "ronaldo";
var fmovie = "animal";

function fav() {
  console.log("Favourite Actor:", factor);
  console.log("Favourite Player:", fplayer);
  console.log("Favourite Movie:", fmovie);
}

fav()

function area(length, breadth) {
  console.log("Given length is: ", length, "Given breadth is:", breadth);
  console.log("area =", length*breadth);
}

area(12.5, 24.7)



if (false) {
  console.log("Take your umbrella");
}

else{
  console.log("Umbrella not required");
}

var status = true;

if (false) {
  console.log("Great Job");
}

else {
  console.log("Finish your homework before playing");
}

var cookies = false;

if (cookies) {
  console.log("Would you like a cookie?");
}

else {
  console.log("Time to bake more cookies.");
}



var trafficLight = "erwf";

  if (trafficLight=="red") {
    console.log("Stop");
  }
  else if (trafficLight=="yellow") {
    console.log("Get Ready");
  }
  else if (trafficLight=="green") {
    console.log("Go");
  }
  else {
    console.log("Please check the entered text");
  }

var season="asdf";

if (season == "spring") {
  console.log("Enjoy the blooming flowers");
}
if (season == "summer") {
  console.log("Have fun in the sun");
}
if (season == "autumn", "fall") {
  console.log("Admire the colorful leaves.");
}
if (season == "winter") {
  console.log("Bundle up and stay warm.");
}
else {
  console.log("Please check the entered text");
}

var score=1001;

if (score <= 50) {
  console.log("You need to improve.");
}
if (score > 50 && score<70) {
  console.log("Good Job");
}
if (score>70 && score<100) {
  console.log("Excellent");
}
else if (score >100) {
  console.log("Check the entered text");
}

var score = 10;

if (score%2==0) {
  console.log("The number is even") //while there is no remainder left over then it is even
}
else {
  console.log("The number is odd")//while there are remainder left over then it is odd.
}

for (num=10; num>=1; num--) {
  console.log(num);
}

console.log("breaking point")

for (num1=1; num1<=10; num1++) {
  
  if (num1%2==0) {
    console.log(num1);
  }
}

console.log("breaking point")

for (table=1; table<=20; table++) {
  console.log(table+"x2=", table*2)
}

console.log("breaking point")

var para = document.getElementById("Hello");

console.log(para.textContent);
para.textContent = "World Hello!"
console.log(para.textContent);

var title = document.getElementById("title");
title.textContent="Bye World!"
console.log(title.textContent);


var change = document.getElementById("change");

function change1() {
  title.textContent="Hello World!";
}

function goback() {
  title.textContent="Bye World";
}

function store() {
  var box1 = document.getElementById("num1");
  var box2 = document.getElementById("num2");
  var result = document.getElementById("resul2");
  
  console.log(box1.value);
  console.log(box2.value);
}



