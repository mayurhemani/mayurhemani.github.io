int[] xs = new int[50];
int[] ys = new int[50];
int[] dir_x = new int[50];
int[] dir_y = new int[50];
int[] followed = new int[50];
int step = 10;

int leader_x = 0;
int leader_y = 0;
int leader_dir_x = 0;
int leader_dir_y = 0;


void setup()
{
	size(320, 240);
	background(0, 0, 0);
	fill(255, 0, 0, 255);

	for (int i = 0; i < 50; ++i) {
		xs[i] = random(320);
		ys[i] = random(240);
		dir_x[i] = (random(100) > 50) ? step : -step;
		dir_y[i] = (random(100) > 50) ? step : -step;
		followed[i] = 0;
	}

	leader_x = random(320);
	leader_y = random(240);
	leader_dir_x = step;
	leader_dir_y = step;
	frameRate(16);
}

int toss(int thresh) {
	if (random(100) < thresh) {
		return 1;
	}
	return 0;
}

int inProximity(int diffx, int diffy) {
	if (abs(diffx) < 20 &&  abs(diffy) < 20) {
		return 1;
	}
	return 0;
}

void makeFollower(int i) {
	dir_x[i] = leader_dir_x;
	dir_y[i] = leader_dir_y;
	if (xs[i] == leader_x) {
		xs[i] = leader_x + random(5);
	}
	if (ys[i] == leader_y) {
		ys[i] = leader_y + random(5);
	}
	followed[i] = 1;
}

void dropFollowing(i) {
	dir_x[i] = toss(50) ? step : -step;
	dir_y[i] = toss(50) ? step : -step;
	xs[i] += random(10);
	ys[i] += random(10);
	followed[i] = 0;
}

int decideFollowing(int i) {
	int diffx = xs[i] - leader_x;
	int diffy = ys[i] - leader_y;
	if (inProximity(diffx, diffy) == 1) {
		if (followed[i] == 0 && toss(70) == 1) {
			makeFollower(i);
			return 2;
		} else if (followed[i] == 1 && toss(5) == 1) {
			dropFollowing(i);
			return 0;
		}
	} 
	return followed[i];
}


int nextDirX(int x, int dirx) {
	int dx = x + dirx;
	if (dx <= 0  ||  dx >= 320) 
		return -dirx;
	return dirx;
}

int nextDirY(int y, int diry) {
	int dy = y + diry;
	if (dy <= 0  ||  dy >= 240) 
		return -diry;
	return diry;
}


void draw() 
{	
  background(0, 0, 0);
  int f = 0;
	// followers
	for (int i = 0; i < 50; ++i) {
		// draw follower
		f = decideFollowing(i);
		if (f == 0) {
			fill(255, 0, 0, 255);
		} else if (f == 1) {
			fill(255, 255, 0, 255);                
    } else {
			fill(0, 0, 255, 255);
		}
		ellipse(xs[i], ys[i], 10, 10);

		// update followers
		dir_x[i] = nextDirX(xs[i], dir_x[i]);
		dir_y[i] = nextDirY(ys[i], dir_y[i]);
		xs[i] += dir_x[i];
		ys[i] += dir_y[i];
	}

	// draw leader
	fill(0, 255, 0, 255);
	ellipse(leader_x, leader_y, 10, 10);

	// update leader
	leader_dir_x = nextDirX(leader_x, leader_dir_x);
	leader_dir_y = nextDirY(leader_y, leader_dir_y);
	leader_x += leader_dir_x;
	leader_y += leader_dir_y;
}