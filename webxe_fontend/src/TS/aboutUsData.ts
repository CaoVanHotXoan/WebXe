// Kiểu dữ liệu dùng chung cho thông tin thành viên của đội ngũ.
export type TeamMember = {
  id: number;
  name: string;
  role: string;
  image: string;
  description: string;
};

// Dữ liệu hiển thị cho các thẻ thành viên trên trang About Us.
export const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: 'Cao Văn Hột Xoàn',
    role: 'Trưởng nhóm / Back-end Developer',
    image: 'https://scontent.fsgn7-2.fna.fbcdn.net/v/t39.30808-1/611680924_2088148908670599_6800285959678229508_n.jpg?stp=dst-jpg_tt6&cstp=mx1788x1774&ctp=s200x200&_nc_cat=106&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=e99d92&_nc_eui2=AeGqLrG3BjBk470sOO3ZUTYn_KHGTGZkRIr8ocZMZmREitF5vFz8sKGjIcm33ojs4ovCHq_wi7W5aT6Ff_3kbdI2&_nc_ohc=UbSoamcb3hUQ7kNvwE1h72d&_nc_oc=Adr8n4Tuzk8kF3dUejt-73s8KyjZtGPJa5VkK94BarENaKHG3lgM6yU1sm9f1Lxiy4FAiCNapMjICChNVFXWfq2f&_nc_zt=24&_nc_ht=scontent.fsgn7-2.fna&_nc_gid=33Ow61Symqj_X1dvJgf5Jg&_nc_ss=7b2a8&oh=00_AQLS6zuXsZzUMGA14JMJZz6aGcTWchaD9byzKrOzj5COPg&oe=6AA7F0C1',
    description:
      'Định hướng sản phẩm và xây dựng trải nghiệm mua bán xe trực quan. Đạt phụ trách kiến trúc giao diện, kết nối các luồng dữ liệu và đảm bảo mọi màn hình hoạt động ổn định.',
  },
  {
    id: 2,
    name: 'Phạm Tiến Doanh',
    role: 'Front-end Developer',
    image: 'https://scontent.fsgn7-1.fna.fbcdn.net/v/t39.30808-1/721626064_1323253706663120_54196552785698589_n.jpg?stp=dst-jpg_tt6&cstp=mx1024x1024&ctp=s200x200&_nc_cat=107&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=e99d92&_nc_eui2=AeFvZOpAYTMb8WepqqokRNZAdLL7T_0RGOR0svtP_REY5Fbl_jmkF7hSbie3H-Q2fhyABQknYAkJy8fqh_CmK5uq&_nc_ohc=q5r1Sn4AhUEQ7kNvwHxHrDc&_nc_oc=Adq-Qolyz0J9KOdKDwD4tCsEPOEm9CK4JaI2TgM53y9VkvMYM2r_62xTkSA_B5_hQ1CxVixibtztXzVkRrF-pWie&_nc_zt=24&_nc_ht=scontent.fsgn7-1.fna&_nc_gid=klTw1eMeyCpPSeIsVcirOw&_nc_ss=7b2a8&oh=00_AQKXxhbcXVSt0Kzb2Bk94eaLSg22jFtGiYaXTxcK6E2Qzw&oe=6AA81EC4',
    description:
      'Nghiên cứu nhu cầu người dùng và biến chúng thành những màn hình rõ ràng, dễ sử dụng. Doanh chăm chút hệ thống màu sắc, bố cục và các tương tác nhỏ của sản phẩm.',
  },
  {
    id: 3,
    name: 'Trần Minh Khoa',
    role: 'Backend Developer',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=85',
    description:
      'Xây dựng nền tảng dữ liệu tin cậy cho danh sách xe, tin tức và tài khoản. Khoa tập trung vào hiệu năng API, tính bảo mật và khả năng mở rộng của hệ thống.',
  },
  {
    id: 4,
    name: 'Lê Hoàng Anh',
    role: 'Content & Marketing',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=900&q=85',
    description:
      'Kể những câu chuyện hữu ích về xe và kết nối thương hiệu với cộng đồng. Hoàng Anh quản lý nội dung, hình ảnh và các chiến dịch giúp khách hàng tìm được chiếc xe phù hợp.',
  },
];
