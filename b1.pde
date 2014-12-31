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
	size(640, 480);
	background(0, 0, 0);
	fill(255, 0, 0, 255);

	for (int i = 0; i < 50; ++i) {
		xs[i] = random(640);
		ys[i] = random(480);
		dir_x[i] = (random(100) > 50) ? step : -step;
		dir_y[i] = (random(100) > 50) ? step : -step;
		followed[i] = 0;
	}

	leader_x = random(640);
	leader_y = random(480);
	leader_dir_x = step;
	leader_dir_y = step;
}

void draw() 
{	
	
	fill(0, 0, 0, 255);
	ellipse(leader_x, leader_y, 10, 10);

	fill(0, 0, 0, 255);
	for (int i = 0; i < 50; ++i) {
		ellipse(xs[i], ys[i], 10, 10);
	}

	fill(255, 0, 0, 255);
	for (int i = 0; i < 50; ++i) {
		
		int diffx = xs[i] - leader_x;
		int diffy = ys[i] - leader_y;

		if (followed[i] == 0 && abs(diffx) < 20 &&  abs(diffy) < 20) {
			xs[i] += diffx / 2;
			ys[i] += diffy / 2;
			dir_x[i] = leader_dir_x;
			dir_y[i] = leader_dir_y;
			if (xs[i] == leader_x) {
				xs[i] = leader_x + random(40);
			}
			if (ys[i] == leader_y) {
				ys[i] = leader_y + random(40);
			}

			int s = random(100);
			if (s >= 20 && s <= 60) {
				dir_x[i] = (dir_x[i] > 0) ? -step : step;
				dir_y[i] = (dir_y[i] > 0) ? -step : step;
			}

			fill(0, 0, 255, 255);
		}


		xs[i] += dir_x[i];
		ys[i] += dir_y[i];
		if (xs[i] > 640) {
			xs[i] = 640;
			dir_x[i] = 0 - step;
		}
		if (xs[i] < 0) {
			xs[i] = 0;
			dir_x[i] = step;
		}
		if (ys[i] > 480) {
			ys[i] = 480;
			dir_y[i] = 0 - step;
		}
		if (ys[i] < 0) {
			ys[i] = 0;
			dir_y[i] = step;
		}

		ellipse(xs[i], ys[i], 10, 10);
	}

	leader_x += leader_dir_x;
	leader_y += leader_dir_y;
	if (leader_x > 640) {
		leader_x = 640;
		leader_dir_x = 0 - step;
	}
	if (leader_x < 0) {
		leader_x = 0;
		leader_dir_x = step;
	}
	if (leader_y > 480) {
		leader_y = 480;
		leader_dir_y = 0 - step;
	}
	if (leader_y < 0) {
		leader_y = 0;
		leader_dir_y = step;
	}
	
	fill(0, 255, 0, 255);
	ellipse(leader_x, leader_y, 10, 10);
}

