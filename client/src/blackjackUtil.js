import QH from './cards/Q-H.png'
import QS from './cards/Q-S.png'
import QD from './cards/Q-D.png'
import QC from './cards/Q-C.png'
import KH from './cards/K-H.png'
import KS from './cards/K-S.png'
import KD from './cards/K-D.png'
import KC from './cards/K-C.png'
import JH from './cards/J-H.png'
import JS from './cards/J-S.png'
import JD from './cards/J-D.png'
import JC from './cards/J-C.png'
import AH from './cards/A-H.png'
import AS from './cards/A-S.png'
import AD from './cards/A-D.png'
import AC from './cards/A-C.png'
import H2 from './cards/2-H.png'
import S2 from './cards/2-S.png'
import D2 from './cards/2-D.png'
import C2 from './cards/2-C.png'
import H3 from './cards/3-H.png'
import S3 from './cards/3-S.png'
import D3 from './cards/3-D.png'
import C3 from './cards/3-C.png'
import H4 from './cards/4-H.png'
import S4 from './cards/4-S.png'
import D4 from './cards/4-D.png'
import C4 from './cards/4-C.png'
import H5 from './cards/5-H.png'
import S5 from './cards/5-S.png'
import D5 from './cards/5-D.png'
import C5 from './cards/5-C.png'
import H6 from './cards/6-H.png'
import S6 from './cards/6-S.png'
import D6 from './cards/6-D.png'
import C6 from './cards/6-C.png'
import H7 from './cards/7-H.png'
import S7 from './cards/7-S.png'
import D7 from './cards/7-D.png'
import C7 from './cards/7-C.png'
import H8 from './cards/8-H.png'
import S8 from './cards/8-S.png'
import D8 from './cards/8-D.png'
import C8 from './cards/8-C.png'
import H9 from './cards/9-H.png'
import S9 from './cards/9-S.png'
import D9 from './cards/9-D.png'
import C9 from './cards/9-C.png'
import H10 from './cards/10-H.png'
import S10 from './cards/10-S.png'
import D10 from './cards/10-D.png'
import C10 from './cards/10-C.png'
import './blackjack.css';

export function cardToSrc(val) {
  switch(val){
    case 'Q-H':
      return QH;
    case 'Q-S':
      return QS;
    case 'Q-D':
      return QD;
    case 'Q-C':
      return QC;
    case 'K-H':
      return KH;
    case 'K-S':
      return KS;
    case 'K-D':
      return KD;
    case 'K-C':
      return KC;
    case 'J-H':
      return JH;
    case 'J-S':
      return JS;
    case 'J-D':
      return JD;
    case 'J-C':
      return JC;
    case 'A-H':
      return AH;
    case 'A-S':
      return AS;
    case 'A-D':
      return AD;
    case 'A-C':
      return AC;
    case '2-H':
      return H2;
    case '2-S':
      return S2;
    case '2-D':
      return D2;
    case '2-C':
      return C2;
    case '3-H':
      return H3;
    case '3-S':
      return S3;
    case '3-D':
      return D3;
    case '3-C':
      return C3;
    case '4-H':
      return H4;
    case '4-S':
      return S4;
    case '4-D':
      return D4;
    case '4-C':
      return C4;
    case '5-H':
      return H5;
    case '5-S':
      return S5;
    case '5-D':
      return D5;
    case '5-C':
      return C5;
    case '6-H':
      return H6;
    case '6-S':
      return S6;
    case '6-D':
      return D6;
    case '6-C':
      return C6;
    case '7-H':
      return H7;
    case '7-S':
      return S7;
    case '7-D':
      return D7;
    case '7-C':
      return C7;
    case '8-H':
      return H8;
    case '8-S':
      return S8;
    case '8-D':
      return D8;
    case '8-C':
      return C8;
    case '9-H':
      return H9;
    case '9-S':
      return S9;
    case '9-D':
      return D9;
    case '9-C':
      return C9;
    case '10-H':
      return H10;
    case '10-S':
      return S10;
    case '10-D':
      return D10;
    case '10-C':
      return C10;
    default:
      return;
  }
}
