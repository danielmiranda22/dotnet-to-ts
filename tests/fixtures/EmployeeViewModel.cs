public class EmployeeViewModel
{
  public int Id { get; set; }
  public string Name { get; set; }
  public EntityDto Entity { get; set; }
  public DepartmentDto Department { get; set; }
  public List<string> Roles { get; set; }
  public DateTime LastLogin { get; set; }
  public bool IsActive { get; set; }
}
