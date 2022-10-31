import { MyFunction } from "./someFiles/module1";
import { MyClass } from "./someFiles/otherFiles/module2";
import { MyClass2 } from "./someFiles/otherFiles/skipped script";

let instance1 = new MyFunction();
let instance2 = new MyClass();
let instance3 = new MyClass2();

instance1.MySubFunction();
instance2.MyFunction();
instance3.MyFunction();
//