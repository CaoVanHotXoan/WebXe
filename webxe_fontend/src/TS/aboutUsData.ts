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
    name: 'Nguyễn Tiến Đạt',
    role: 'Trưởng nhóm / Frontend Developer',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=900&q=85',
    description:
      'Định hướng sản phẩm và xây dựng trải nghiệm mua bán xe trực quan. Đạt phụ trách kiến trúc giao diện, kết nối các luồng dữ liệu và đảm bảo mọi màn hình hoạt động ổn định.',
  },
  {
    id: 2,
    name: 'Phạm Tiến Doanh',
    role: 'UI/UX Designer',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=85',
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
