
// if else
class MyClass {

#if MY_DIRECTIVE
    myFunction = (data) => {
        return data;
    }
#else
    myFunction = (differentData) => {
        return differentData;
    }
#endif

}

// negative check, commented mode
class MyClass2 {

//#if !MY_DIRECTIVE
    myFunction = (data) => {
        return data;
    }
//#else
    //#post-code myFunction = (differentData) => {
    //#post-code     return differentData;
    //#post-code }
//#endif

}