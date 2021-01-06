import { IconContext } from 'react-icons';
import { FaRegCircle } from 'react-icons/fa';
import { HiOutlineX } from 'react-icons/hi';

export const Circle = () => (
  <IconContext.Provider value={{ size: '63px' }}>
    <div>
      <FaRegCircle />
    </div>
  </IconContext.Provider>
);


export const Iks = () => (
    <IconContext.Provider value={{ size: '86px' }}>
      <div>
        <HiOutlineX />
      </div>
    </IconContext.Provider>
  );

  