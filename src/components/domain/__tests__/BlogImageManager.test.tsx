import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BlogImageManager } from "@/components/domain/BlogImageManager";
import { blogApi } from "@/lib/api";
import type { BlogImage } from "@/types";

jest.mock("@/lib/api", () => ({
  blogApi: { uploadImage: jest.fn() },
}));

const uploadImage = jest.mocked(blogApi.uploadImage);

function image(name: string): File {
  return new File(["image"], name, { type: "image/png" });
}

describe("BlogImageManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    uploadImage.mockImplementation(async (file) => ({
      url: `https://res.cloudinary.com/test/image/upload/${file.name}`,
      alt: "",
    }));
  });

  it("uploads several images and returns their URLs and accessible descriptions", async () => {
    const onChange = jest.fn();
    const onUploadingChange = jest.fn();
    render(
      <BlogImageManager
        images={[]}
        onChange={onChange}
        onUploadingChange={onUploadingChange}
      />,
    );

    await userEvent.upload(screen.getByLabelText("Upload blog images"), [
      image("team-photo.png"),
      image("office.png"),
    ]);

    await waitFor(() =>
      expect(onChange).toHaveBeenLastCalledWith([
        {
          url: "https://res.cloudinary.com/test/image/upload/team-photo.png",
          alt: "team photo",
        },
        {
          url: "https://res.cloudinary.com/test/image/upload/office.png",
          alt: "office",
        },
      ] satisfies BlogImage[]),
    );
    expect(uploadImage).toHaveBeenCalledTimes(2);
    expect(onUploadingChange).toHaveBeenNthCalledWith(1, true);
    expect(onUploadingChange).toHaveBeenLastCalledWith(false);
  });

  it("rejects selections that would exceed three images", async () => {
    const onChange = jest.fn();
    render(
      <BlogImageManager
        images={[{ url: "https://res.cloudinary.com/test/one", alt: "One" }]}
        onChange={onChange}
        onUploadingChange={jest.fn()}
      />,
    );

    await userEvent.upload(screen.getByLabelText("Upload blog images"), [
      image("two.png"),
      image("three.png"),
      image("four.png"),
    ]);

    expect(await screen.findByRole("alert")).toHaveTextContent("at most 3 images");
    expect(uploadImage).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });
});
