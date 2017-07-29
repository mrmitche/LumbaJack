$(document).ready(function(){
	//Canvas stuff
	var canvas = $("#canvas")[0];
	var ctx = canvas.getContext("2d");
	var w = $("#canvas").width();
	var h = $("#canvas").height();
	//console.log("tested");
	
	lumberjack = {};
	lumberjack.obj = "jack";
	lumberjack.x = 0;
	lumberjack.y = 0;
	lumberjack.facing = 1;//0 up, 1 right, 2 down, 3 left
	lumberjack.a = "idle";
	
	tree = {};
	tree.obj = "tree";
	tree.fire;
	tree.cut = false;
	
	grass = {};
	grass.obj = "grass";
	
	var d = "";
	var cw = 25;
	var score = 0;
	var tree_array;
	var treeLimit = 20;//max 1710 for cw = 10
	var chanceOfFire = 10// in %
	var offsetHeight = 3;
	var board_array_height = (h-(offsetHeight-1)*cw)/cw - 1;
	var board_array_width = w/cw - 1;
	//console.log("h:"+board_array_height);
	//console.log("w:"+board_array_width);
	var board_array = [];//Object in array is either tree, lumberjack, or grass
	
	
	init();
	
	//MAIN
	////////////////////////////////////////////
	function init()
	{
	    create_trees();
		paint_background();
		paint_score();
		paint_trees();
		spawn_lumberjack();
		paint_lumberjack();
		generate_board();
		
		
		if(typeof game_loop != "undefined") clearInterval(game_loop);
		game_loop = setInterval(paint,100);
	}
	////////////////////////////////////////////
	//Generates the board
	function generate_board () 
	{
		//Generates board
		for(var i = 0; i < board_array_width+1; i++)
		{
			var board_col = [];
			for (var j = 0; j < board_array_height+1; j++)
			{
				board_col [j] = grass;
			}
			board_array[i] = board_col;
		}	
		
		//TODO put the generate trees method here
		for (var tree in tree_array){
			var posx = tree_array[tree].x;
			var posy = tree_array[tree].y;
			board_array[posx][posy] = tree_array[tree];
		}
	}
	
	//Paints everything
	function paint()
	{
		paint_background();
		paint_score();
		paint_trees();
		paint_lumberjack();
		move();
		if(lumberjack.a == "cut") cut();
	}
	
	//Paints the background
	function paint_background()
	{
		ctx.fillStyle = "white";
		ctx.fillRect(0, 0, w, h);
		ctx.strokeStyle = "black";
		ctx.strokeRect(0, 0, w, h);
		ctx.strokeRect(0,h-(offsetHeight-1)*cw,w,h-(offsetHeight-1)*cw);
	}
	
	//Paints the score
	function paint_score ()
	{ 
		ctx.fillStyle = "black";
		ctx.strokeStyle = "black";
		var score_text = "Score: " + score;
		ctx.fillText(score_text, 5, h-5);
	}

	//Creates a random forest
	function create_trees()
	{
		var xval;
		var yval;
		tree_array = [];
		for(var i = 0; i < treeLimit; i++)
		{
			do 
			{
			xval = Math.round(Math.random()*(w-cw)/cw);
			yval = Math.round(Math.random()*(h-offsetHeight*cw)/cw);
			}
			while (checkCollision(tree_array, xval, yval) >= 0);
			
			tree_array.push({
								id: i,
								x: xval, 
								y: yval,
								cut: 0,
								fire: Math.round(Math.random()*40),
								obj:"tree"
							});
		}
		//This will create a cell with x/y between 0-44
		//Because there are 45(450/10) positions across the rows and columns
	}
	
	//Paints the trees
	function paint_trees()
	{
		var xcoord;
		var ycoord;
		for (var i = 0; i < treeLimit; i ++) 
		{
			xcoord = tree_array[i].x;
			ycoord = tree_array[i].y;
			if (tree_array[i].fire < chanceOfFire)
				ctx.fillStyle = "orange";
			else if (tree_array[i].cut == 1)
				ctx.fillStyle = "brown";
			else
				ctx.fillStyle = "green";
			
			ctx.fillRect(xcoord*cw, ycoord*cw, cw, cw);
			ctx.strokeStyle = "white";
			ctx.strokeRect(xcoord*cw, ycoord*cw, cw, cw);
		}
	}
	
	//Spawns the lumberjack
	function spawn_lumberjack()
	{
		do
		{
			lumberjack.x = Math.round(Math.random()*(w-cw)/cw)
			lumberjack.y = Math.round(Math.random()*(h-offsetHeight*cw)/cw)
		}	
		while(checkCollision(tree_array, lumberjack.x, lumberjack.y)>=0);	
		lumberjack.facing = 1;
	}
	
	//Paints the lumberjack
	function paint_lumberjack()
	{
		ctx.fillStyle = "red";
		ctx.fillRect(lumberjack.x*cw, lumberjack.y*cw, cw, cw);
		ctx.strokeStyle = "white";
		ctx.strokeRect(lumberjack.x*cw, lumberjack.y*cw, cw, cw);
		ctx.fillStyle = "black";
		ctx.font = "10px sans-serif";
		ctx.fillText(lumberjack.facing, lumberjack.x*cw+5, lumberjack.y*cw+12);
	}
	
	//Checks for a collision with a tree 
	//Returns the index of the collision in tree_array
	function checkCollision (tree_array, xcoord, ycoord)
	{
		for (var i = 0; i < tree_array.length; i++)
		{
			if (tree_array[i].x == xcoord && tree_array[i].y == ycoord)
				{
					return i;
				}
		}
		return -1;
	}
	
	//Moves the lumberjack
	//Moves the lumberjack
	function move(){
		if(d == "right" && lumberjack.x < board_array_width && board_array[lumberjack.x+1][lumberjack.y].obj == "grass") lumberjack.x ++;
		else if(d == "left" && lumberjack.x > 0&& board_array[lumberjack.x-1][lumberjack.y].obj == "grass") lumberjack.x --;
		else if(d == "up" && lumberjack.y > 0&& board_array[lumberjack.x][lumberjack.y-1].obj == "grass") lumberjack.y --;
		else if(d == "down" && lumberjack.y < board_array_height&& board_array[lumberjack.x][lumberjack.y+1].obj == "grass") lumberjack.y ++;
		d="";
	}
	function cut(){
		//facing up
		if(lumberjack.facing == 0){
			if(lumberjack.y == 0){
			}
			//Only cuts if object is a tree, hasn't been cut, and is not on fire!
			else if(board_array[lumberjack.x][lumberjack.y-1].obj == "tree" && board_array[lumberjack.x][lumberjack.y-1].cut == 0 && tree_array[board_array[lumberjack.x][lumberjack.y-1].id].fire >= chanceOfFire){
				tree_array[board_array[lumberjack.x][lumberjack.y-1].id].cut = 1;
				score++;
			}
			else{
				console.log("NO TREE");
			}
		}
		//facing right
		else if(lumberjack.facing == 1){
			if(lumberjack.x == board_array_width){
			}
			else if(board_array[lumberjack.x+1][lumberjack.y].obj == "tree" && board_array[lumberjack.x+1][lumberjack.y].cut == 0){
				tree_array[board_array[lumberjack.x+1][lumberjack.y].id].cut = 1;
				score++;			}
			else{
				console.log("NO TREE");
			}
		} 
		//facing down
		else if(lumberjack.facing == 2){
			if(lumberjack.y == board_array_height){
			}
			else if(board_array[lumberjack.x][lumberjack.y+1].obj == "tree" && board_array[lumberjack.x][lumberjack.y+1].cut == 0){
				tree_array[board_array[lumberjack.x][lumberjack.y+1].id].cut = 1;
				score++;
			}
			else{
				console.log("NO TREE");
			}
		}
		//facing left
		else if(lumberjack.facing == 3){
			if(lumberjack.x == 0){
			}
			else if(board_array[lumberjack.x-1][lumberjack.y].obj == "tree" && board_array[lumberjack.x-1][lumberjack.y].cut == 0){
				tree_array[board_array[lumberjack.x-1][lumberjack.y].id].cut = 1;
				score++;
			}
			else{
				console.log("NO TREE");
			}
		}
		lumberjack.a = "idle";
	}
	
	//Lets add the keyboard controls now
	//key == 32 for spacebar
	$(document).keydown(function(e){
		var key = e.which;
		//We will add another clause to prevent reverse gear
		if(key == "37"){ 
			d = "left"; 
			lumberjack.facing = 3;
		}
		else if(key == "38"){ 
			d = "up"; 
			lumberjack.facing = 0;
		}
		else if(key == "39"){ 
			d = "right"; 
			lumberjack.facing = 1;
		}
		else if(key == "40"){ 
			d = "down"; 
			lumberjack.facing = 2;
		}
		else if(key == "32"){
			lumberjack.a = "cut";
		}
		//The snake is now keyboard controllable
	})
	
	//Buttons
$("#left").mousedown(function(){
d = "left";
lumberjack.facing = 3;
});

$("#up").mousedown(function(){
d = "up";
lumberjack.facing = 0;
});

$("#right").mousedown(function(){
d = "right";
lumberjack.facing = 1;
});

$("#down").mousedown(function(){
d = "down";
lumberjack.facing = 2;
});
	
$("#chop").mousedown(function(){
lumberjack.a="cut";
});

})