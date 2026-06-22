export interface District {
  id: number;
  name: string;
  tamil: string;
  regions: string[];
  count: string;
}

export const districts: District[] = [
  { id: 1, name: "Chennai", tamil: "சென்னை", regions: ["north", "coastal"], count: "8,420" },
  { id: 2, name: "Coimbatore", tamil: "கோயம்புத்தூர்", regions: ["west"], count: "5,180" },
  { id: 3, name: "Madurai", tamil: "மதுரை", regions: ["south"], count: "4,120" },
  { id: 4, name: "Ariyalur", tamil: "அரியலூர்", regions: ["central"], count: "420" },
  { id: 5, name: "Chengalpattu", tamil: "செங்கல்பட்டு", regions: ["north", "coastal"], count: "2,350" },
  { id: 6, name: "Cuddalore", tamil: "கடலூர்", regions: ["central", "coastal"], count: "1,680" },
  { id: 7, name: "Dharmapuri", tamil: "தருமபுரி", regions: ["west"], count: "980" },
  { id: 8, name: "Dindigul", tamil: "திண்டுக்கல்", regions: ["south", "hills"], count: "1,540" },
  { id: 9, name: "Erode", tamil: "ஈரோடு", regions: ["west"], count: "2,150" },
  { id: 10, name: "Kallakurichi", tamil: "கள்ளக்குறிச்சி", regions: ["north"], count: "890" },
  { id: 11, name: "Kancheepuram", tamil: "காஞ்சிபுரம்", regions: ["north"], count: "3,110" },
  { id: 12, name: "Karur", tamil: "கரூர்", regions: ["central"], count: "940" },
  { id: 13, name: "Krishnagiri", tamil: "கிருஷ்ணகிரி", regions: ["west"], count: "1,120" },
  { id: 14, name: "Mayiladuthurai", tamil: "மயிலாடுதுறை", regions: ["central", "coastal"], count: "870" },
  { id: 15, name: "Nagapattinam", tamil: "நாகப்பட்டினம்", regions: ["central", "coastal"], count: "910" },
  { id: 16, name: "Namakkal", tamil: "நாமக்கல்", regions: ["west"], count: "1,310" },
  { id: 17, name: "Perambalur", tamil: "பெரம்பலூர்", regions: ["central"], count: "390" },
  { id: 18, name: "Pudukkottai", tamil: "புதுக்கோட்டை", regions: ["central", "south"], count: "1,140" },
  { id: 19, name: "Ramanathapuram", tamil: "இராமநாதபுரம்", regions: ["south", "coastal"], count: "1,050" },
  { id: 20, name: "Ranipet", tamil: "இராணிப்பேட்டை", regions: ["north"], count: "780" },
  { id: 21, name: "Salem", tamil: "சேலம்", regions: ["west"], count: "3,480" },
  { id: 22, name: "Sivaganga", tamil: "சிவகங்கை", regions: ["south"], count: "860" },
  { id: 23, name: "Tenkasi", tamil: "தென்காசி", regions: ["south"], count: "1,220" },
  { id: 24, name: "Thanjavur", tamil: "தஞ்சாவூர்", regions: ["central"], count: "2,280" },
  { id: 25, name: "The Nilgiris", tamil: "நீலகிரி", regions: ["west", "hills"], count: "650" },
  { id: 26, name: "Theni", tamil: "தேனி", regions: ["south", "hills"], count: "990" },
  { id: 27, name: "Thiruvallur", tamil: "திருவள்ளூர்", regions: ["north"], count: "2,640" },
  { id: 28, name: "Thiruvannamalai", tamil: "திருவண்ணாமலை", regions: ["north"], count: "1,450" },
  { id: 29, name: "Thiruvarur", tamil: "திருவாரூர்", regions: ["central", "coastal"], count: "930" },
  { id: 30, name: "Thoothukudi", tamil: "தூத்துக்குடி", regions: ["south", "coastal"], count: "1,790" },
  { id: 31, name: "Tiruchirappalli", tamil: "திருச்சிராப்பள்ளி", regions: ["central"], count: "3,150" },
  { id: 32, name: "Tirunelveli", tamil: "திருநெல்வேலி", regions: ["south"], count: "2,840" },
  { id: 33, name: "Tirupathur", tamil: "திருப்பத்தூர்", regions: ["north"], count: "680" },
  { id: 34, name: "Tiruppur", tamil: "திருப்பூர்", regions: ["west"], count: "2,460" },
  { id: 35, name: "Vellore", tamil: "வேலூர்", regions: ["north"], count: "2,050" },
  { id: 36, name: "Viluppuram", tamil: "விழுப்புரம்", regions: ["north"], count: "1,620" },
  { id: 37, name: "Virudhunagar", tamil: "விருதுநகர்", regions: ["south"], count: "1,410" },
  { id: 38, name: "Kanyakumari", tamil: "கன்னியாகுமரி", regions: ["south", "coastal"], count: "1,980" }
];