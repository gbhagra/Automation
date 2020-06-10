
let Puppeteer= require("puppeteer");
let fs=require("fs-extra");
let credentialsFile=process.argv[2];
let email,pwd,instagram;
//list of follower ans following
let followingArray = [];
let followerArray = [];
(async function(){try{
//credentials
let data= await fs.promises.readFile(credentialsFile,"utf-8");
let credentials=JSON.parse(data);
email=credentials.email;
pwd=credentials.pwd;
instagram=credentials.instagram;


//Start browser
let browser=await Puppeteer.launch({
headless:false,
defaultViewPort: null,
args: ["--start-maximized","--disable-notifcations"]// open window in maximum mode
});
//new tab open
let numberOfPages=await browser.pages();
let tab= numberOfPages[0];
//goto login page 
await tab.goto(instagram);
// logging in
await tab.waitForSelector("input[aria-label='Phone number, username, or email']");
await tab.type("input[aria-label='Phone number, username, or email']",email);
await tab.waitForSelector("input[aria-label='Password']");

await tab.type("input[aria-label='Password']",pwd);
await tab.click(".sqdOP.L3NKy.y3zKF",{ waitUntil: "networkidle2" });
await tab.waitForNavigation({ waitUntil: "networkidle2" });
await tab.goto(`https://www.instagram.com/${email}/`,{ waitUntil: "networkidle2" });
await tab.waitFor(3000);
// parallel opening followers and following
await Promise.all([getList( browser , followerArray , "followers") , getList(browser , followingArray , "following")]);
// finding users who dont follow back
let ans = [];
//to print output on console
//console.log(followerArray.length);
//console.log(followingArray.length);
let myMap= new Map();
for(let i=0;i<followerArray.length;i++){
    myMap.set(followerArray[i],true);
}

for(let i=0;i<followingArray.length;i++){
    if(!myMap.has(followingArray[i]))
    ans.push(followingArray[i]);
}
//to print output on console
//await console.log(ans.length);
//await console.log(ans);
let str="<h1> THESE USERS DON'T FOLLOW YOU BACK </h1>" +"<br>";
for(let i=0;i<ans.length;i++)
{
str=str+ans[i]+" ,"+"<br>";
}
const page= await browser.newPage();

 await page.setContent(`<p>${str}  </p>`);


//await page.close();
 //await tab.close();

 
}catch(err){
    console.log(err);
}

})();


async function scrollDown(selector, page) {
    await page.evaluate(async selector => {
        const section = document.querySelector(selector);
        await new Promise((resolve, reject) => {
            let totalHeight = 0;
            let distance = 100;
            const timer = setInterval(() => {
                var scrollHeight = section.scrollHeight;
                section.scrollTop = 100000000;
                totalHeight += distance;

                if (totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    }, selector);
}
// generating lists
async function getList( browser , list , item){
    
    let newtab = await browser.newPage();
    await newtab.goto(`https://www.instagram.com/${email}/`,{ waitUntil: "networkidle2" });
    await newtab.click(`a[href='/${email}/${item}/']`,{ waitUntil: "networkidle2" });
    await newtab.waitFor(3000);
    await scrollDown( "div[role='dialog'] .isgrP" ,newtab );
    await newtab.waitForSelector(".FPmhX.notranslate._0imsa");
    let followerselement = await newtab.$$(".FPmhX.notranslate._0imsa",{ waitUntil: "networkidle2" });
    
     for(let i=0;i<followerselement.length;i++){
     let nexttext = await (await followerselement[i].getProperty('title')).jsonValue();
     list.push(nexttext);

     }
     newtab.close();
    

}
