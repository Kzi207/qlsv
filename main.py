# AI NGOÀI ANH
# Cài phiên bản python 3.12 để tránh lỗi nhé 
import sys,os,time,threading,subprocess

def install(pkg):
    try:
        subprocess.check_call([sys.executable,"-m","pip","install",pkg],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        os.execv(sys.executable,['python']+sys.argv)
    except: pass

try: import pygame
except: install("pygame")

FILE="song.mp3" # đặt file âm thanh cùng file python này nhé
PAD="   "

lyric="""
0.00|Lại phải ngước mắt lên bầu trời mong cho em không yêu lầm người
4.85|Không phải lựa chọn tồi
6.84|Em xin, em xin mà, nếu không, nếu không
10.80|Em biết phải làm gì đây?
14.09|Không yêu ai khác ngoài anh!
16.39|Say mê ai ngoài anh!
18.81|Thơm lên đôi mắt của anh!
21.01|Chỉ thích anh, và anh, anh và anh, mỗi mình anh (yeah)
23.67|Không yêu ai khác ngoài anh!
25.96|Say mê ai ngoài anh!
28.30|Thơm lên tất cả của anh!
30.65|Chỉ thích em là của anh (yeah)
33.40|
"""

faces=["( ˘ ▽ ˘ )","( ˘ ◡ ˘ )","( ◕ ‿ ◕ )","( v ◡ v )","( > ◡ < )","( ^ ‿ ^ )","( ¬ ‿ ¬ )","( ✧ ω ✧ )"]
notes=["♩","♪","♫","♬","✦","✧"]

cur_text=""
running=True
has_music=False
start_t=0

def parse_data(raw):
    ds=[]
    for line in raw.strip().split("\n"):
        try:
            p=line.split("|")
            txt=p[1].strip() if len(p)>1 else ""
            ds.append({"t":float(p[0]),"txt":txt})
        except: continue
    return ds

def get_time():
    if has_music and pygame.mixer.music.get_busy():
        return pygame.mixer.music.get_pos()/1000.0
    return time.time()-start_t

def ui_thread():
    tick=0
    sys.stdout.write("\033[?25l")
    WIDTH=30
    while running:
        slow=tick//6
        offset=abs((slow%8)-4)
        icon=faces[(tick//25)%len(faces)]
        note=notes[(tick//8)%len(notes)]
        content=f"{icon} {note}"
        pad_l=" "*offset
        pad_r=" "*max(0,WIDTH-len(pad_l)-len(content))
        line1=f"\033[K{PAD}{cur_text}\033[0m"
        line2=f"\033[K{PAD}\033[93m{pad_l}{content}{pad_r}\033[0m"
        sys.stdout.write(f"\033[H\n{line1}\n{line2}")
        sys.stdout.flush()
        tick+=1
        time.sleep(0.05)

def fx_fade(txt,dur):
    global cur_text
    if not txt: return
    t_in=min(0.5,dur*0.2)
    t_hold=max(0,dur-t_in*2)
    steps=10
    for i in range(steps):
        c=int((i/steps)*255)
        cur_text=f"\033[38;2;{c};{c};{c}m{txt}"
        time.sleep(t_in/steps)
    cur_text=f"\033[38;2;200;255;255m{txt}"
    time.sleep(t_hold)
    for i in range(steps):
        c=int(255-(i/steps)*255)
        cur_text=f"\033[38;2;{c};{c};{c}m{txt}"
        time.sleep(t_in/steps)
    cur_text=""

def fx_karaoke(txt,dur):
    global cur_text
    if not txt: return
    c_dim,c_lit,c_head="\033[90m","\033[95m","\033[97m"
    cur_text=f"{c_dim}{txt}"
    run_t=max(0.1,dur-0.4)
    delay=run_t/(len(txt)+1)
    for i in range(len(txt)+1):
        done=txt[:i]
        rem=txt[i+1:] if i+1<len(txt) else ""
        head=txt[i] if i<len(txt) else ""
        cur_text=f"{c_lit}{done}{c_head}{head}{c_dim}{rem}"
        time.sleep(delay)
    cur_text=f"{c_lit}{txt}"
    time.sleep(0.3)
    cur_text=""

if __name__=="__main__":
    os.system('cls' if os.name=='nt' else 'clear')
    if os.path.exists(FILE):
        try:
            pygame.mixer.init()
            pygame.mixer.music.load(FILE)
            has_music=True
        except: pass

    lyrics=parse_data(lyric)
    print("\n")

    t=threading.Thread(target=ui_thread)
    t.start()

    if has_music:
        pygame.mixer.music.play()
    start_t=time.time()

    try:
        for i,line in enumerate(lyrics):
            target=line["t"]
            txt=line["txt"]
            if i<len(lyrics)-1:
                duration=lyrics[i+1]["t"]-target
            else:
                duration=5.0
            while get_time()<target:
                time.sleep(0.01)
            if i%2==0: fx_fade(txt,duration)
            else: fx_karaoke(txt,duration)

        if has_music:
            while pygame.mixer.music.get_busy():
                time.sleep(0.1)

    except KeyboardInterrupt:
        pass

    finally:
        running=False
        if has_music: pygame.mixer.music.stop()
        t.join()
        sys.stdout.write("\033[?25h")
        os.system('cls' if os.name=='nt' else 'clear')
        print("Done.")
