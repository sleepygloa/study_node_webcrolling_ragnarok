const { default: axios } = require('axios');
var express = require('express');
var cheerio = require('cheerio');
var http = require('http');
var app = express();
var server = http.createServer(app);
const models = require('./models');

app.get('/', function(req, res){
  res.send("테스트");
});

app.get('/getItemListIdSet', function(req, res) {
  let itemList;
  models.ItemList.findAll({
    //limit:2
  }).then((result)=>{
    itemList = result;
    //console.log(itemList);

    if(itemList.length > 0) console.log(itemList.length);

    for(var i = 0; i < itemList.length; i++){
      let id = itemList[i].dataValues.id;
      let link = itemList[i].dataValues.link;
      let index = link.split('ID=')[1];

      models.ItemList.update({
        index
      },{
        where: {
            id
        }
      }).then((result)=>{
          // res.send({result:true})
      }).catch((error)=>{
          console.error(error);
          //res.status(500).send('에러가 발생했습니다.', error);
      })
    }

  }).catch((error)=>{
      console.log(error);
      //res.status(500).send('에러가 발생했습니다.',error);
  })
});


app.get('/getItemList', function(req, res) {
  //models.destroy();

  //res.send('root page');
  let itemList = [];
  let ulList = [];
  let errorList = [];

  //https://ro.gnjoy.com/guide/runemidgarts/itemview.asp?itemSeq=1&ID=1128
  let index = 0;
  let page = 1;
  let playAlert = setInterval(function() {

    // if(page > 20) intevalEnd(playAlert);
    try {
      // for(var j = 1; j < 20; j++){
        
        
        axios.get('https://ro.gnjoy.com/guide/runemidgarts/itemWeaponList.asp?ordername=Seq&ordertype=ASC&curpage='+page)
        .then((value)=>{
            // console.log('value ', value);
    
            const $ = cheerio.load(value.data);
            const $bodyList = $("table.itemMain tbody");
            // console.log($bodyList.children('tr').eq(0).find('td img').attr('src'));
            let trindex = $bodyList.find('tr').length;

            for(var z = 0; z < trindex; z++){
              if(index == null) continue;
              console.log(page+" 페이지 / "+index+" 번째 요청중...");
              if($bodyList.children('tr').eq(z).find('td img').attr('src') == undefined) clearInterval(playAlert);

              let itemImg = $bodyList.children('tr').eq(z).find('td img').attr('src');
              let link = $bodyList.children('tr').eq(z).find('td.left a').attr('href');
              let name = $bodyList.children('tr').eq(z).find('td.left a').text();
              let category = $bodyList.children('tr').eq(z).children('td').eq(2).text();
              let attack = $bodyList.children('tr').eq(z).children('td').eq(3).text();
              let equipJob = $bodyList.children('tr').eq(z).children('td').eq(4).text();

              models.ItemList.create({
                index,
                itemImg,
                link,
                name,
                category,
                attack,
                equipJob
              });

              //   ulList[z] = {
              //     itemImg : $bodyList.children('tr').eq(z).find('td img').attr('src'),
              //     link : $bodyList.children('tr').eq(z).find('td.left a').attr('href'),
              //     name : $bodyList.children('tr').eq(z).find('td.left a').text(),
              //     category : $bodyList.children('tr').eq(z).children('td').eq(2).text(),
              //     attack : $bodyList.children('tr').eq(z).children('td').eq(3).text(),
              //     equipJob : $bodyList.children('tr').eq(z).children('td').eq(4).text(),
              // };
              
              itemList[index] = ulList[z];
              index++;
            }
            
          page++;
          
        }).catch((error)=>{
          intevalEnd(playAlert);
        })
    
      // };
    } catch (error) {
      intevalEnd(playAlert);
    }
  }, 10000);

});

function intevalEnd(method){
  console.log(itemList);
  console.log('인터벌 종료');
  clearInterval(method);
}

app.get('/getItemDetail', function(req, res) {
  const {code} = req.params;

  getItemDetail(code);
});

function getItemDetail(code){
    let rootList = [];
    let ulList = [];
    let errorList = [];
  
    let cnt = 0;
  
    console.log(j+" 번째 요청중...");
    
    axios.get('https://ro.gnjoy.com/guide/runemidgarts/itemview.asp?itemSeq=1&ID='+code)
    .then((value)=>{
        // console.log('value ', value);

        const $ = cheerio.load(value.data);
        const $bodyList = $("section.guideContents.item01Contents");
        const $bodyListTbody = $("section.guideContents.item01Contents tbody");
    
        $bodyList.each(function(i, elem) {
          ulList[i] = {
              category: $(this).find('h2').text(),
              itemNm: $(this).find('div.itemExplain h3').text(),
              itemImg : $(this).find('div.itemExplain > p.img_itemDetail > img').attr('src'),
              itemDesc: $(this).find('div.itemExplain > p').text(),
              itemType : $bodyListTbody.children('tr').eq(1).find('td').text(), //분류
              slotCount : $bodyListTbody.children('tr').eq(2).find('td').text(), //슬롯개수
              attack : $bodyListTbody.children('tr').eq(3).find('td').text(), //공격력
              itemLevel : $bodyListTbody.children('tr').eq(4).find('td').text(), //무기레벨
              equipLevel : $bodyListTbody.children('tr').eq(5).find('td').text(), //착용레벨
              equipJob : $bodyListTbody.children('tr').eq(6).find('td').text(), //직업
              weight : $bodyListTbody.children('tr').eq(7).find('td').text(), //무게
              setitem : $bodyListTbody.children('tr').eq(8).find('td').text(), //세트아이템
              dropMonster : $bodyListTbody.children('tr').eq(9).find('td').text(), //드랍 몬스터
          };
        });
        // console.log(ulList);
        rootList[cnt] = ulList[i];
        cnt++;
    
        // const data = ulList.filter(n => n.title);
        // return data;

    }).catch((error)=>{
        console.error('error '+i+'번째');
        
    })
    console.log(rootList);
}


server.listen(3000, '127.0.0.1', function() {
    console.log('Server listen on port ' + server.address().port);
    models.sequelize.sync().then(()=>{
      console.log('DB 연결 성공!');
  }).catch(()=>{
      console.log(err);
      console.log('DB 연결 에러ㅠ');
      process.exit();
  })
});




